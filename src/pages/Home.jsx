import { Link } from 'react-router-dom';
import { useCallback } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useInterval } from '../hooks/useInterval';
import { getLiveMatches, getAllMatches, getTrendingPlayers } from '../services/api/cricketApi';
import { getNewsList, getActivePolls } from '../services/firebase/firestoreService';
import MatchCard from '../components/match/MatchCard';
import NewsCard from '../components/news/NewsCard';
import PlayerCard from '../components/player/PlayerCard';
import PollCard from '../components/poll/PollCard';
import { MatchSkeleton, PlayerSkeleton, NewsSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import './Home.css';

const LIVE_POLL_INTERVAL_MS = 60_000; // matches getLiveMatches TTL — see cricketApi.js

export default function Home() {
  const { data: liveMatches, loading: liveLoading, refetch: refetchLive } = useFetch(() => getLiveMatches(), []);
  const { data: allMatches, loading: allLoading } = useFetch(() => getAllMatches(), []);
  const { data: trendingPlayers, loading: playersLoading } = useFetch(() => getTrendingPlayers(), []);
  const { data: news, loading: newsLoading } = useFetch(() => getNewsList({ limitCount: 3 }), []);
  const { data: polls, loading: pollsLoading } = useFetch(() => getActivePolls(), []);

  // Only worth polling once we know there's at least one live match to watch.
  useInterval(
    useCallback(() => refetchLive(), [refetchLive]),
    liveMatches?.length > 0 ? LIVE_POLL_INTERVAL_MS : null
  );

  const totalMatches = allMatches?.length ?? null;
  const liveCount = liveMatches?.length ?? null;

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero__inner">
          <h1>Live Cricket. Real Stats. One Place.</h1>
          <p>Follow every ball, every series, every player — in one premium dashboard.</p>
          <div className="hero__actions">
            <Link to="/live" className="btn btn--primary btn--md">View Live Matches</Link>
            <Link to="/matches" className="btn btn--outline btn--md">Explore Matches</Link>
          </div>
        </div>
      </section>

      <section className="container home-section">
        <div className="home-section__head">
          <h2><span className="live-dot" /> Live Matches</h2>
          <Link to="/live" className="home-section__link">View all →</Link>
        </div>
        {liveLoading && (
          <div className="home-grid home-grid--matches">
            <MatchSkeleton /><MatchSkeleton /><MatchSkeleton />
          </div>
        )}
        {!liveLoading && !liveMatches?.length && (
          <EmptyState title="No live matches right now" message="Check back soon, or browse upcoming fixtures." />
        )}
        {!liveLoading && liveMatches?.length > 0 && (
          <div className="home-grid home-grid--matches">
            {liveMatches.slice(0, 3).map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        )}
      </section>

      <section className="container home-section">
        <div className="home-section__head">
          <h2>Trending Players</h2>
        </div>
        {playersLoading && (
          <div className="home-grid home-grid--players">
            <PlayerSkeleton /><PlayerSkeleton /><PlayerSkeleton /><PlayerSkeleton />
          </div>
        )}
        {!playersLoading && trendingPlayers?.length > 0 && (
          <div className="home-grid home-grid--players">
            {trendingPlayers.slice(0, 4).map((p) => <PlayerCard key={p.id} player={p} />)}
          </div>
        )}
      </section>

      {!pollsLoading && polls?.length > 0 && (
        <section className="container home-section">
          <div className="home-section__head">
            <h2>Fan Poll</h2>
          </div>
          <div className="home-grid home-grid--polls">
            {polls.slice(0, 2).map((p) => <PollCard key={p.id} poll={p} />)}
          </div>
        </section>
      )}

      <section className="container home-section">
        <div className="home-section__head">
          <h2>Latest News</h2>
          <Link to="/news" className="home-section__link">View all →</Link>
        </div>
        {newsLoading && (
          <div className="home-grid home-grid--news">
            <NewsSkeleton /><NewsSkeleton /><NewsSkeleton />
          </div>
        )}
        {!newsLoading && !news?.length && (
          <EmptyState title="No news yet" message="Published articles will appear here." />
        )}
        {!newsLoading && news?.length > 0 && (
          <div className="home-grid home-grid--news">
            {news.map((a) => <NewsCard key={a.id} article={a} />)}
          </div>
        )}
      </section>

      <section className="container home-section stats-section">
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <span className="stat-card__label">Total Matches</span>
            <span className="stat-card__value">{allLoading ? '—' : totalMatches}</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-card__label">Live Matches</span>
            <span className="stat-card__value">{liveLoading ? '—' : liveCount}</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-card__label">Top Run Scorer</span>
            <span className="stat-card__value">—</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-card__label">Top Wicket Taker</span>
            <span className="stat-card__value">—</span>
          </div>
        </div>
        <p className="stats-section__note">
          Top run scorer / wicket taker need a leaderboard endpoint not included in the free Cricket API tier.
        </p>
      </section>
    </div>
  );
}
