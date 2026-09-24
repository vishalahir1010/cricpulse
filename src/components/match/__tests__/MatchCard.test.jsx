import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MatchCard from '../MatchCard';

const liveMatch = {
  id: 'match-1',
  name: 'India vs Australia, 3rd ODI',
  matchType: 'odi',
  status: 'India need 17 runs from 9 balls',
  matchStarted: true,
  matchEnded: false,
  teams: ['India', 'Australia'],
  teamInfo: [],
  score: [
    { inning: 'India Inning 1', r: 184, w: 4, o: 18.3 },
    { inning: 'Australia Inning 1', r: 180, w: 7, o: 20 },
  ],
};

const upcomingMatch = {
  id: 'match-2',
  name: 'England vs New Zealand, 2nd T20I',
  matchType: 't20',
  matchStarted: false,
  matchEnded: false,
  teams: ['England', 'New Zealand'],
  teamInfo: [],
  score: [],
  date: '2026-12-01',
};

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('MatchCard', () => {
  it('shows both team names and formatted scores for a live match', () => {
    renderWithRouter(<MatchCard match={liveMatch} />);
    expect(screen.getByText('India')).toBeInTheDocument();
    expect(screen.getByText('Australia')).toBeInTheDocument();
    expect(screen.getByText('184/4 (18.3 ov)')).toBeInTheDocument();
    expect(screen.getByText('180/7 (20 ov)')).toBeInTheDocument();
  });

  it('shows a LIVE badge for a started, unfinished match', () => {
    renderWithRouter(<MatchCard match={liveMatch} />);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('shows an Upcoming tag and no score for a match that has not started', () => {
    renderWithRouter(<MatchCard match={upcomingMatch} />);
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
    expect(screen.queryByText('LIVE')).not.toBeInTheDocument();
  });

  it('links to the correct match details route', () => {
    renderWithRouter(<MatchCard match={liveMatch} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/matches/match-1');
  });
});
