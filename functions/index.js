const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();
setGlobalOptions({ maxInstances: 10, region: 'us-central1' });

// ---------------------------------------------------------------------------
// Admin role management
// ---------------------------------------------------------------------------
// The client (src/context/AuthContext.jsx) reads admin status from the
// Firebase ID token's custom claims (`role: 'admin'`), never from a
// client-writable Firestore field. This is the only place that claim is
// ever granted, and only an existing admin may call it — see
// scripts/bootstrapFirstAdmin.js for how the very first admin gets set.
exports.setAdminRole = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  const caller = await admin.auth().getUser(request.auth.uid);
  if (caller.customClaims?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only an existing admin can grant admin access.');
  }

  const { email, makeAdmin = true } = request.data || {};
  if (!email || typeof email !== 'string') {
    throw new HttpsError('invalid-argument', 'A target user email is required.');
  }

  const targetUser = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(targetUser.uid, makeAdmin ? { role: 'admin' } : {});

  // Keep the Firestore user doc's `role` field (used for display only, the
  // security rules never trust it) in sync with the real claim.
  await admin.firestore().doc(`users/${targetUser.uid}`).set(
    { role: makeAdmin ? 'admin' : 'user' },
    { merge: true }
  );

  return { success: true, uid: targetUser.uid, isAdmin: makeAdmin };
});

// ---------------------------------------------------------------------------
// Push notifications for followed matches
// ---------------------------------------------------------------------------
// The client now calls the Cricket/Weather APIs directly (see
// src/services/api/cricketApi.js) rather than through a proxy function, so
// this is the only place left that still needs the Cricket API key
// server-side — checking a followed match's status on a schedule has to
// happen here regardless, since nothing in Firestore itself changes when
// the score does.
const { onSchedule } = require('firebase-functions/v2/scheduler');

const CRICKET_BASE_URL = 'https://api.cricapi.com/v1';
const CHECK_INTERVAL = 'every 5 minutes';

exports.checkFollowedMatches = onSchedule(
  { schedule: CHECK_INTERVAL, secrets: ['CRICKET_API_KEY'] },
  async () => {
    const db = admin.firestore();

    // 1. Find every currently-followed match across all users, and who's
    // following each one, via a single collectionGroup query rather than
    // looping over every user document.
    const followedSnap = await db.collectionGroup('followedMatches').get();
    if (followedSnap.empty) return;

    const followersByMatch = new Map(); // matchId -> Set<uid>
    followedSnap.forEach((docSnap) => {
      const matchId = docSnap.id;
      const uid = docSnap.ref.parent.parent.id; // users/{uid}/followedMatches/{matchId}
      if (!followersByMatch.has(matchId)) followersByMatch.set(matchId, new Set());
      followersByMatch.get(matchId).add(uid);
    });

    // 2. For each distinct match, ask the Cricket API for its current
    // status and compare to what we saw last time.
    for (const [matchId, uidSet] of followersByMatch) {
      let matchInfo;
      try {
        const url = new URL(`${CRICKET_BASE_URL}/match_info`);
        url.searchParams.set('apikey', process.env.CRICKET_API_KEY);
        url.searchParams.set('id', matchId);
        const res = await fetch(url.toString());
        const json = await res.json();
        if (json.status !== 'success') continue;
        matchInfo = json.data;
      } catch {
        continue; // this match's check failed — try again next run
      }

      const cacheRef = db.doc(`matchStatusCache/${matchId}`);
      const cacheSnap = await cacheRef.get();
      const previousStatus = cacheSnap.exists ? cacheSnap.data().status : null;
      const currentStatus = matchInfo.status;
      const matchEnded = !!matchInfo.matchEnded;

      // Nothing changed since last check, or (defensively) we've already
      // notified for this exact "ended" status before — skip.
      if (currentStatus === previousStatus) continue;

      await cacheRef.set(
        { status: currentStatus, matchEnded, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );

      // 3. Gather every follower's device tokens and push the update.
      const uids = [...uidSet];
      const tokenDocs = await Promise.all(
        uids.map((uid) => db.collection(`users/${uid}/fcmTokens`).get())
      );
      const tokens = tokenDocs.flatMap((snap) => snap.docs.map((d) => d.id));
      if (tokens.length === 0) continue;

      const message = {
        notification: {
          title: matchInfo.name || 'Match update',
          body: currentStatus || 'Score updated',
        },
        data: { matchId },
        tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      // Clean up tokens that are no longer valid (uninstalled app,
      // revoked permission, expired) so we stop trying to notify them.
      const staleTokens = [];
      response.responses.forEach((r, i) => {
        if (!r.success && r.error?.code === 'messaging/registration-token-not-registered') {
          staleTokens.push(tokens[i]);
        }
      });
      if (staleTokens.length > 0) {
        await Promise.all(
          staleTokens.map((token) =>
            Promise.all(uids.map((uid) => db.doc(`users/${uid}/fcmTokens/${token}`).delete().catch(() => {})))
          )
        );
      }
    }
  }
);
