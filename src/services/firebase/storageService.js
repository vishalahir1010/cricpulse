import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebaseConfig';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validateImage(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG or WebP images are allowed');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image must be smaller than 5MB');
  }
}

export async function uploadNewsImage(file, newsId) {
  validateImage(file);
  const storageRef = ref(storage, `news/${newsId}/cover-${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadAvatar(file, uid) {
  validateImage(file);
  const storageRef = ref(storage, `users/${uid}/avatar-${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteImage(path) {
  await deleteObject(ref(storage, path));
}
