#!/usr/bin/env node
/**
 * One-time script to grant the very first admin their custom claim.
 * setAdminRole (the Cloud Function) requires an existing admin caller, so
 * this script uses the Admin SDK directly with a service account key
 * instead — run it once, then use the Admin Dashboard's user management
 * (backed by setAdminRole) for every admin after that.
 *
 * Usage:
 *   1. Firebase Console -> Project Settings -> Service accounts ->
 *      "Generate new private key" -> save as scripts/serviceAccountKey.json
 *      (already in .gitignore — never commit this file)
 *   2. node scripts/bootstrapFirstAdmin.js someone@example.com
 */
const admin = require('firebase-admin');
const path = require('path');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/bootstrapFirstAdmin.js <email>');
  process.exit(1);
}

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch {
  console.error(
    `Couldn't find ${serviceAccountPath}.\n` +
    'Download it from Firebase Console -> Project Settings -> Service accounts -> Generate new private key.'
  );
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

async function main() {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
  await admin.firestore().doc(`users/${user.uid}`).set({ role: 'admin' }, { merge: true });
  console.log(`✓ ${email} (${user.uid}) is now an admin.`);
  console.log('They must sign out and back in (or wait ~1 hour) for the new token to take effect.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to set admin role:', err.message);
  process.exit(1);
});
