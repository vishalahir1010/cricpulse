import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit as fsLimit,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// --- Favorites (teams & players) ------------------------------------------

export async function toggleFavorite(uid, type, item) {
  const ref = doc(db, 'users', uid, 'favorites', `${type}_${item.id}`);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, { type, ...item, addedAt: serverTimestamp() });
  return true;
}

export async function getFavorites(uid, type) {
  const q = query(collection(db, 'users', uid, 'favorites'), where('type', '==', type));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// --- Followed matches --------------------------------------------------------

export async function toggleFollowMatch(uid, match) {
  const ref = doc(db, 'users', uid, 'followedMatches', match.id);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, { ...match, followedAt: serverTimestamp() });
  return true;
}

export async function getFollowedMatches(uid) {
  const snap = await getDocs(collection(db, 'users', uid, 'followedMatches'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// --- News --------------------------------------------------------------------

export async function getNewsList({ category, featured, limitCount = 20 } = {}) {
  const constraints = [orderBy('createdAt', 'desc'), fsLimit(limitCount)];
  if (category) constraints.unshift(where('category', '==', category));
  if (featured) constraints.unshift(where('featured', '==', true));
  const q = query(collection(db, 'news'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// The category filter is kept index-free so published categories work even
// before firestore.indexes.json has been deployed.
export async function getNewsPage({ category, featured, pageSize = 9, cursor = null } = {}) {
  const constraints = [];
  if (category) constraints.push(where('category', '==', category));
  if (featured) constraints.push(where('featured', '==', true));
  const q = query(collection(db, 'news'), ...constraints);
  const snap = await getDocs(q);
  const allItems = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => timestampValue(b.createdAt) - timestampValue(a.createdAt));
  const offset = typeof cursor === 'number' ? cursor : 0;
  const items = allItems.slice(offset, offset + pageSize);
  const nextOffset = offset + items.length;
  const nextCursor = nextOffset < allItems.length ? nextOffset : null;

  return { items, nextCursor, hasMore: nextCursor !== null };
}

function timestampValue(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  return new Date(value).getTime() || 0;
}

export async function getNewsBySlug(slug) {
  const q = query(collection(db, 'news'), where('slug', '==', slug), fsLimit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

export async function createNews(newsData) {
  const ref = await addDoc(collection(db, 'news'), {
    ...newsData,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateNews(newsId, newsData) {
  await setDoc(doc(db, 'news', newsId), newsData, { merge: true });
}

export async function deleteNews(newsId) {
  await deleteDoc(doc(db, 'news', newsId));
}

// --- Comments ------------------------------------------------------------------
// parentType is 'news' or 'matches'; parentId is the news doc id or match id.

export function subscribeToComments(parentType, parentId, callback) {
  const q = query(
    collection(db, parentType, parentId, 'comments'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function addComment(parentType, parentId, comment) {
  if (!comment.message?.trim()) {
    throw new Error('Comment cannot be empty');
  }
  await addDoc(collection(db, parentType, parentId, 'comments'), {
    ...comment,
    message: comment.message.trim(),
    createdAt: serverTimestamp(),
  });
}

export async function deleteComment(parentType, parentId, commentId) {
  await deleteDoc(doc(db, parentType, parentId, 'comments', commentId));
}

export async function reportComment(parentType, parentId, commentId, reporterUid) {
  await addDoc(collection(db, 'reports'), {
    parentType,
    parentId,
    commentId,
    reporterUid,
    createdAt: serverTimestamp(),
    status: 'open',
  });
}

// --- Polls -----------------------------------------------------------------------

export async function getActivePolls() {
  const q = query(collection(db, 'polls'), where('active', '==', true), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function castVote(pollId, uid, optionId) {
  const voteRef = doc(db, 'polls', pollId, 'votes', uid);
  const existing = await getDoc(voteRef);
  if (existing.exists()) {
    throw new Error('You have already voted on this poll');
  }
  await setDoc(voteRef, { optionId, votedAt: serverTimestamp() });
}

export async function getPollResults(pollId) {
  const snap = await getDocs(collection(db, 'polls', pollId, 'votes'));
  const counts = {};
  snap.docs.forEach((d) => {
    const { optionId } = d.data();
    counts[optionId] = (counts[optionId] || 0) + 1;
  });
  return counts;
}

export async function createPoll(pollData) {
  const ref = await addDoc(collection(db, 'polls'), {
    ...pollData,
    active: true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
