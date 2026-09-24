import { describe, it, expect } from 'vitest';
import { formatScore, strikeRate, economyRate, truncate, slugify } from '../formatters';

describe('formatScore', () => {
  it('formats runs/wickets/overs when all present', () => {
    expect(formatScore({ r: 184, w: 4, o: 18.3 })).toBe('184/4 (18.3 ov)');
  });

  it('defaults wickets to 10 (all out) when w is missing', () => {
    expect(formatScore({ r: 250, o: 50 })).toBe('250/10 (50 ov)');
  });

  it('omits the overs suffix when o is missing', () => {
    expect(formatScore({ r: 120, w: 3 })).toBe('120/3');
  });

  it('returns null for a falsy or run-less entry', () => {
    expect(formatScore(null)).toBeNull();
    expect(formatScore(undefined)).toBeNull();
    expect(formatScore({ w: 2, o: 10 })).toBeNull();
  });
});

describe('strikeRate', () => {
  it('computes runs per 100 balls to 2 decimals', () => {
    expect(strikeRate(50, 40)).toBe('125.00');
  });

  it('returns 0.00 when balls is 0', () => {
    expect(strikeRate(10, 0)).toBe('0.00');
  });
});

describe('economyRate', () => {
  it('computes runs conceded per over to 2 decimals', () => {
    expect(economyRate(38, 4)).toBe('9.50');
  });

  it('returns 0.00 when overs is 0', () => {
    expect(economyRate(10, 0)).toBe('0.00');
  });
});

describe('truncate', () => {
  it('leaves short text untouched', () => {
    expect(truncate('short text', 100)).toBe('short text');
  });

  it('truncates long text and appends an ellipsis', () => {
    const long = 'a'.repeat(150);
    const result = truncate(long, 100);
    expect(result.length).toBe(101); // 100 chars + ellipsis
    expect(result.endsWith('…')).toBe(true);
  });

  it('returns an empty string for falsy input', () => {
    expect(truncate(null)).toBe('');
    expect(truncate(undefined)).toBe('');
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('India seal series with dominant chase')).toBe('india-seal-series-with-dominant-chase');
  });

  it('strips punctuation', () => {
    expect(slugify('"We back our bowlers" — captain')).toBe('we-back-our-bowlers-captain');
  });

  it('trims surrounding whitespace before slugifying', () => {
    expect(slugify('  Padded Title  ')).toBe('padded-title');
  });
});
