// STATIC DATA — same caveat as rankings.js: the free Cricket API has no
// records/all-time-stats endpoint, so this is manually sourced from
// ESPNcricinfo/Wikipedia/Guinness World Records and verified as of the
// date below. Only records we could confidently verify are included —
// rather than guess a number, ambiguous ones are left out of the array
// entirely and Records.jsx shows an honest "not verified yet" note for
// any category with no entries.
export const RECORDS_LAST_VERIFIED = '20 September 2026';
export const RECORDS_SOURCE = 'ESPNcricinfo / Wikipedia / Guinness World Records';

export const RECORDS = {
  'Most Runs': [
    { player: 'Sachin Tendulkar', country: 'India', format: 'ODI', value: '18,426 runs' },
    { player: 'Sachin Tendulkar', country: 'India', format: 'Test', value: '15,921 runs' },
  ],
  'Most Wickets': [
    { player: 'Muttiah Muralitharan', country: 'Sri Lanka', format: 'Test', value: '800 wickets' },
    { player: 'Muttiah Muralitharan', country: 'Sri Lanka', format: 'ODI', value: '534 wickets' },
  ],
  'Highest Score': [
    { player: 'Brian Lara', country: 'West Indies', format: 'Test', value: '400* (v England, 2004)' },
    { player: 'Rohit Sharma', country: 'India', format: 'ODI', value: '264 (v Sri Lanka, 2014)' },
    { player: 'Aaron Finch', country: 'Australia', format: 'T20I', value: '172 (v Zimbabwe, 2018)' },
  ],
  'Best Bowling': [
    { player: 'Jim Laker', country: 'England', format: 'Test (innings)', value: '10/53 (v Australia, 1956)' },
    { player: 'Chaminda Vaas', country: 'Sri Lanka', format: 'ODI', value: '8/19 (v Zimbabwe, 2001)' },
    { player: 'Syazrul Idrus', country: 'Malaysia', format: 'T20I', value: '7/8 (v China, 2023)' },
  ],
  'Most Sixes': [
    { player: 'Rohit Sharma', country: 'India', format: 'ODI (career)', value: 'Most career sixes in ODI history' },
    { player: 'Babar Azam', country: 'Pakistan', format: 'T20I (career)', value: 'Most career runs; see icc-cricket.com for current sixes tally' },
  ],
  'Most Centuries': [
    { player: 'Virat Kohli', country: 'India', format: 'ODI (career)', value: '54 centuries (as of 18 Jan 2026)' },
    { player: 'Sachin Tendulkar', country: 'India', format: 'ODI (career, prior record)', value: '49 centuries' },
  ],
  // Not confidently verifiable at research time (qualifier thresholds vary
  // by source) — intentionally left empty rather than guessed.
  'Best Strike Rate': [],
};
