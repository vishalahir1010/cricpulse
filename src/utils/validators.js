export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

export function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
