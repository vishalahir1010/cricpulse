// STATIC DATA — the free Cricket API has no standalone /teams endpoint.
// International team membership is slow-moving (new Full Members are rare),
// so a manually maintained list is reasonable here, unlike rankings/records
// which change after every match. flagCode is an ISO 3166-1 alpha-2 code
// used to render an emoji flag — no logo images are hotlinked.
export const TEAMS_LAST_VERIFIED = '20 September 2026';

export const INTERNATIONAL_TEAMS = [
  { name: 'India', flagCode: 'IN', status: 'Full Member' },
  { name: 'Australia', flagCode: 'AU', status: 'Full Member' },
  { name: 'England', flagCode: 'GB', status: 'Full Member' },
  { name: 'New Zealand', flagCode: 'NZ', status: 'Full Member' },
  { name: 'South Africa', flagCode: 'ZA', status: 'Full Member' },
  { name: 'Pakistan', flagCode: 'PK', status: 'Full Member' },
  { name: 'Sri Lanka', flagCode: 'LK', status: 'Full Member' },
  { name: 'Bangladesh', flagCode: 'BD', status: 'Full Member' },
  { name: 'West Indies', flagCode: 'JM', status: 'Full Member' },
  { name: 'Afghanistan', flagCode: 'AF', status: 'Full Member' },
  { name: 'Zimbabwe', flagCode: 'ZW', status: 'Full Member' },
  { name: 'Ireland', flagCode: 'IE', status: 'Full Member' },
  { name: 'Scotland', flagCode: 'GB-SCT', status: 'Associate Member' },
  { name: 'Netherlands', flagCode: 'NL', status: 'Associate Member' },
  { name: 'Nepal', flagCode: 'NP', status: 'Associate Member' },
  { name: 'United States', flagCode: 'US', status: 'Associate Member' },
  { name: 'United Arab Emirates', flagCode: 'AE', status: 'Associate Member' },
  { name: 'Namibia', flagCode: 'NA', status: 'Associate Member' },
];

function flagEmoji(code) {
  // Only handles plain ISO alpha-2 codes; special ones (e.g. Scotland,
  // West Indies) fall back to a cricket-ball icon in TeamCard instead.
  if (!/^[A-Z]{2}$/.test(code)) return null;
  return String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)));
}

export function getTeamFlag(flagCode) {
  return flagEmoji(flagCode) || '🏏';
}
