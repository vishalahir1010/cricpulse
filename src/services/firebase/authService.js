import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

const googleProvider = new GoogleAuthProvider();

async function createUserDoc(user) {
  await setDoc(
    doc(db, 'users', user.uid),
    {
      uid: user.uid,
      displayName: user.displayName || '',
      email: user.email,
      photoURL: user.photoURL || '',
      role: 'user',
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function registerWithEmail(name, email, password) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: name });
  await createUserDoc({ ...user, displayName: name });
  return user;
}

export async function loginWithEmail(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function loginWithGoogle() {
  const { user } = await signInWithPopup(auth, googleProvider);
  await createUserDoc(user);
  return user;
}

export async function logout() {
  await signOut(auth);
}
