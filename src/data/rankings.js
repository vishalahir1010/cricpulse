// STATIC DATA — not from the live Cricket API (the free tier has no
// rankings endpoint). Manually sourced from ICC / ESPNcricinfo and
// verified as of the date below. These numbers will drift out of date as
// real matches are played — re-verify and update this file periodically
// rather than presenting it as live data.
export const RANKINGS_LAST_VERIFIED = '20 September 2026';
export const RANKINGS_SOURCE = 'ICC official rankings (via ESPNcricinfo / Wikipedia)';

export const TEAM_RANKINGS = {
  Test: [
    { rank: 1, team: 'Australia', rating: 131 },
    { rank: 2, team: 'South Africa', rating: 119 },
    { rank: 3, team: 'New Zealand', rating: 106 },
    { rank: 4, team: 'India', rating: 104 },
    { rank: 5, team: 'England', rating: 99 },
  ],
  ODI: [
    { rank: 1, team: 'India', rating: 116 },
    { rank: 2, team: 'New Zealand', rating: 109 },
    { rank: 3, team: 'Australia', rating: 102 },
    { rank: 3, team: 'South Africa', rating: 102 },
    { rank: 5, team: 'Pakistan', rating: 100 },
  ],
  T20: [
    { rank: 1, team: 'India', rating: 268 },
    { rank: 1, team: 'England', rating: 268 },
    { rank: 3, team: 'Australia', rating: 260 },
    { rank: 4, team: 'New Zealand', rating: 247 },
    { rank: 5, team: 'South Africa', rating: 244 },
  ],
};

export const PLAYER_RANKINGS = {
  Test: {
    Batters: [
      { rank: 1, name: 'Harry Brook', country: 'England', rating: 856 },
      { rank: 2, name: 'Steven Smith', country: 'Australia', rating: 840 },
      { rank: 3, name: 'Joe Root', country: 'England', rating: 820 },
      { rank: 4, name: 'Travis Head', country: 'Australia', rating: 811 },
      { rank: 5, name: 'Temba Bavuma', country: 'South Africa', rating: 775 },
      { rank: 6, name: 'Rachin Ravindra', country: 'New Zealand', rating: 740 },
      { rank: 7, name: 'Rishabh Pant', country: 'India', rating: 713 },
      { rank: 8, name: 'Daryl Mitchell', country: 'New Zealand', rating: 710 },
      { rank: 9, name: 'Shubman Gill', country: 'India', rating: 709 },
      { rank: 10, name: 'Kamindu Mendis', country: 'Sri Lanka', rating: 706 },
    ],
    Bowlers: [
      { rank: 1, name: 'Mitchell Starc', country: 'Australia', rating: 872 },
      { rank: 2, name: 'Matt Henry', country: 'New Zealand', rating: 861 },
      { rank: 3, name: 'Jasprit Bumrah', country: 'India', rating: 853 },
      { rank: 4, name: 'Pat Cummins', country: 'Australia', rating: 841 },
      { rank: 5, name: 'Ollie Robinson', country: 'England', rating: 831 },
      { rank: 6, name: 'Marco Jansen', country: 'South Africa', rating: 825 },
      { rank: 7, name: 'Kagiso Rabada', country: 'South Africa', rating: 807 },
      { rank: 8, name: 'Scott Boland', country: 'Australia', rating: 804 },
      { rank: 9, name: 'Noman Ali', country: 'Pakistan', rating: 785 },
      { rank: 10, name: 'Josh Hazlewood', country: 'Australia', rating: 783 },
    ],
    'All-rounders': [
      { rank: 1, name: 'Ravindra Jadeja', country: 'India', rating: 422 },
      { rank: 2, name: 'Marco Jansen', country: 'South Africa', rating: 344 },
      { rank: 3, name: 'Mehidy Hasan Miraz', country: 'Bangladesh', rating: 314 },
      { rank: 4, name: 'Mitchell Starc', country: 'Australia', rating: 276 },
      { rank: 5, name: 'Wiaan Mulder', country: 'South Africa', rating: 245 },
      { rank: 6, name: 'Pat Cummins', country: 'Australia', rating: 234 },
      { rank: 7, name: 'Washington Sundar', country: 'India', rating: 229 },
      { rank: 8, name: 'Gus Atkinson', country: 'England', rating: 229 },
      { rank: 9, name: 'Justin Greaves', country: 'West Indies', rating: 225 },
      { rank: 10, name: 'Joe Root', country: 'England', rating: 204 },
    ],
  },
  ODI: {
    Batters: [
      { rank: 1, name: 'Shubman Gill', country: 'India', rating: 801 },
      { rank: 2, name: 'Daryl Mitchell', country: 'New Zealand', rating: 794 },
      { rank: 3, name: 'Virat Kohli', country: 'India', rating: 767 },
      { rank: 4, name: 'Rohit Sharma', country: 'India', rating: 758 },
      { rank: 5, name: 'Ibrahim Zadran', country: 'Afghanistan', rating: 719 },
      { rank: 6, name: 'Babar Azam', country: 'Pakistan', rating: 689 },
      { rank: 7, name: 'Joe Root', country: 'England', rating: 674 },
      { rank: 8, name: 'Shai Hope', country: 'West Indies', rating: 673 },
      { rank: 9, name: 'Charith Asalanka', country: 'Sri Lanka', rating: 659 },
      { rank: 10, name: 'Harry Tector', country: 'Ireland', rating: 653 },
    ],
    Bowlers: [
      { rank: 1, name: 'Rashid Khan', country: 'Afghanistan', rating: 714 },
      { rank: 2, name: 'Abrar Ahmed', country: 'Pakistan', rating: 675 },
      { rank: 3, name: 'Jofra Archer', country: 'England', rating: 649 },
      { rank: 4, name: 'Mitchell Santner', country: 'New Zealand', rating: 645 },
      { rank: 5, name: 'Keshav Maharaj', country: 'South Africa', rating: 644 },
      { rank: 6, name: 'Maheesh Theekshana', country: 'Sri Lanka', rating: 641 },
      { rank: 7, name: 'Bernard Scholtz', country: 'Namibia', rating: 613 },
      { rank: 8, name: 'Shaheen Shah Afridi', country: 'Pakistan', rating: 604 },
      { rank: 9, name: 'Mehidy Hasan Miraz', country: 'Bangladesh', rating: 602 },
      { rank: 10, name: 'Adil Rashid', country: 'England', rating: 599 },
    ],
    'All-rounders': [
      { rank: 1, name: 'Azmatullah Omarzai', country: 'Afghanistan', rating: 337 },
      { rank: 2, name: 'Mehidy Hasan Miraz', country: 'Bangladesh', rating: 260 },
      { rank: 3, name: 'Sikandar Raza', country: 'Zimbabwe', rating: 258 },
      { rank: 4, name: 'Michael Bracewell', country: 'New Zealand', rating: 250 },
      { rank: 5, name: 'Mitchell Santner', country: 'New Zealand', rating: 247 },
      { rank: 6, name: 'Mohammad Nabi', country: 'Afghanistan', rating: 238 },
      { rank: 7, name: 'Rashid Khan', country: 'Afghanistan', rating: 232 },
      { rank: 8, name: 'Axar Patel', country: 'India', rating: 210 },
      { rank: 9, name: 'Wanindu Hasaranga', country: 'Sri Lanka', rating: 205 },
    ],
  },
  T20: {
    Batters: [
      { rank: 1, name: 'Ishan Kishan', country: 'India', rating: 913 },
      { rank: 2, name: 'Abhishek Sharma', country: 'India', rating: 862 },
      { rank: 3, name: 'Sahibzada Farhan', country: 'Pakistan', rating: 848 },
      { rank: 4, name: 'Philip Salt', country: 'England', rating: 799 },
      { rank: 5, name: 'Dewald Brevis', country: 'South Africa', rating: 789 },
      { rank: 6, name: 'Pathum Nissanka', country: 'Sri Lanka', rating: 751 },
      { rank: 7, name: 'Jos Buttler', country: 'England', rating: 748 },
      { rank: 8, name: 'Tilak Varma', country: 'India', rating: 740 },
      { rank: 9, name: 'Harry Brook', country: 'England', rating: 734 },
      { rank: 10, name: 'Mitchell Marsh', country: 'Australia', rating: 706 },
    ],
    // Bowler and all-rounder T20I top-10s weren't confidently verifiable at
    // research time — left empty rather than guessed. Rankings.jsx shows a
    // clear "not verified yet" note for these two instead of the table.
    Bowlers: [],
    'All-rounders': [],
  },
};
