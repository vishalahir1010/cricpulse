import { describe, it, expect } from 'vitest';
import { isValidEmail, isStrongPassword, isNonEmpty } from '../validators';

describe('isValidEmail', () => {
  it('accepts well-formed emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('a.b+c@sub.example.co.in')).toBe(true);
  });

  it('rejects malformed emails', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isStrongPassword', () => {
  it('accepts passwords of 6+ characters', () => {
    expect(isStrongPassword('123456')).toBe(true);
    expect(isStrongPassword('a-much-longer-password')).toBe(true);
  });

  it('rejects short or non-string passwords', () => {
    expect(isStrongPassword('12345')).toBe(false);
    expect(isStrongPassword('')).toBe(false);
    expect(isStrongPassword(undefined)).toBe(false);
    expect(isStrongPassword(123456)).toBe(false);
  });
});

describe('isNonEmpty', () => {
  it('accepts non-blank strings', () => {
    expect(isNonEmpty('hello')).toBe(true);
  });

  it('rejects blank, whitespace-only, or non-string values', () => {
    expect(isNonEmpty('')).toBe(false);
    expect(isNonEmpty('   ')).toBe(false);
    expect(isNonEmpty(null)).toBe(false);
    expect(isNonEmpty(undefined)).toBe(false);
  });
});
