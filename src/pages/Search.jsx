import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import { searchPlayers, getSeries, getAllMatches } from '../services/api/cricketApi';
import { getNewsList } from '../services/firebase/firestoreService';
import PlayerCard from '../components/player/PlayerCard';
import MatchCard from '../components/match/MatchCard';
import SeriesCard from '../components/series/SeriesCard';
import NewsCard from '../components/news/NewsCard';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';
import './Search.css';

export default function Search() {
  const [term, setTerm] = useState('');
  const debounced = useDebounce(term, 400);
  const q = debounced.trim().toLowerCase();

  const { data: players, loading: playersLoading } = useFetch(
    () => (q ? searchPlayers(q) : Promise.resolve([])),
    [q]
  );
  // Only hit the Cricket API / Firestore once the person has actually typed
  // something — these used to fire on every visit to /search regardless of
  // input, burning the free-tier quota for nothing.
  const { data: allMatches, loading: matchesLoading } = useFetch(
    () => (q ? getAllMatches() : Promise.resolve([])),
    [q]
  );
  const { data: allSeries, loading: seriesLoading } = useFetch(
    () => (q ? getSeries() : Promise.resolve([])),
    [q]
  );
  const { data: allNews, loading: newsLoading } = useFetch(
    () => (q ? getNewsList({ limitCount: 50 }) : Promise.resolve([])),
    [q]
  );

  const matches = (allMatches || []).filter((m) => m.name?.toLowerCase().includes(q));
  const series = (allSeries || []).filter((s) => s.name?.toLowerCase().includes(q));
  const news = (allNews || []).filter((n) => n.title?.toLowerCase().includes(q));

  const loading = playersLoading || matchesLoading || seriesLoading || newsLoading;
  const hasAnyResults = players?.length || matches.length || series.length || news.length;

  return (
    <div className="container search-page">
      <h1>Search</h1>

      <div className="search-page__box">
        <FiSearch size={16} />
        <input
          autoFocus
          placeholder="Search players, teams, matches, series, news..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </div>

      {!q && <EmptyState title="Start typing to search" message="Results are grouped by category as you type." />}

      {q && loading && <TableSkeleton rows={4} />}

      {q && !loading && !hasAnyResults && (
        <EmptyState title="No results" message={`Nothing matched "${debounced}".`} />
      )}

      {q && !loading && hasAnyResults > 0 && (
        <>
          {players?.length > 0 && (
            <section className="search-section">
              <h2>Players</h2>
              <div className="search-section__grid search-section__grid--players">
                {players.slice(0, 8).map((p) => <PlayerCard key={p.id} player={p} />)}
              </div>
            </section>
          )}

          {matches.length > 0 && (
            <section className="search-section">
              <h2>Matches</h2>
              <div className="search-section__grid">
                {matches.slice(0, 6).map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            </section>
          )}

          {series.length > 0 && (
            <section className="search-section">
              <h2>Series</h2>
              <div className="search-section__grid">
                {series.slice(0, 6).map((s) => <SeriesCard key={s.id} series={s} />)}
              </div>
            </section>
          )}

          {news.length > 0 && (
            <section className="search-section">
              <h2>News</h2>
              <div className="search-section__grid">
                {news.slice(0, 6).map((n) => <NewsCard key={n.id} article={n} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
