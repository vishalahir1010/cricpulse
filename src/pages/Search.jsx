import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiX, FiUser, FiShield, FiCalendar, FiAward, FiFileText } from 'react-icons/fi';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import { searchPlayers, getSeries, getAllMatches } from '../services/api/cricketApi';
import { getNewsList } from '../services/firebase/firestoreService';
import { INTERNATIONAL_TEAMS, getTeamFlag } from '../data/teams';
import PlayerCard from '../components/player/PlayerCard';
import MatchCard from '../components/match/MatchCard';
import SeriesCard from '../components/series/SeriesCard';
import NewsCard from '../components/news/NewsCard';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';
import './Search.css';

const SEARCH_TABS = ['All', 'Players', 'Teams', 'Matches', 'Series', 'News'];

export default function Search() {
  const [term, setTerm] = useState('');
  const [tab, setTab] = useState('All');
  const debounced = useDebounce(term, 400);
  const q = debounced.trim().toLowerCase();

  const { data: players, loading: playersLoading } = useFetch(
    () => (q ? searchPlayers(q) : Promise.resolve([])),
    [q]
  );
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

  const matchedTeams = q
    ? INTERNATIONAL_TEAMS.filter((t) => t.name.toLowerCase().includes(q))
    : [];
  const matches = (allMatches || []).filter((m) => m.name?.toLowerCase().includes(q));
  const series = (allSeries || []).filter((s) => s.name?.toLowerCase().includes(q));
  const news = (allNews || []).filter((n) => n.title?.toLowerCase().includes(q));

  const loading = playersLoading || matchesLoading || seriesLoading || newsLoading;
  const hasAnyResults = (players?.length || 0) + matchedTeams.length + matches.length + series.length + news.length > 0;

  return (
    <div className="container search-page">
      <div className="page-header">
        <h1 className="page-title">Search</h1>
        <p className="page-subtitle">Search across players, teams, matches, series, and latest news.</p>
      </div>

      <div className="search-page__box glass-card">
        <FiSearch size={18} className="search-page__search-icon" />
        <input
          autoFocus
          placeholder="Search cricket (e.g. Kohli, India, T20 World Cup)..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        {term && (
          <button className="search-page__clear" onClick={() => setTerm('')} aria-label="Clear">
            <FiX size={16} />
          </button>
        )}
      </div>

      {q && (
        <div className="search-page__tabs">
          {SEARCH_TABS.map((t) => (
            <button
              key={t}
              className={`filter-chip${tab === t ? ' filter-chip--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {!q && (
        <EmptyState title="Start typing to search" message="Results are instant and categorized across players, teams, fixtures, and news." />
      )}

      {q && loading && <TableSkeleton rows={4} />}

      {q && !loading && !hasAnyResults && (
        <EmptyState title="No results found" message={`Nothing matched "${debounced}". Try searching with a different keyword.`} />
      )}

      {q && !loading && hasAnyResults && (
        <div className="search-results-wrap">
          {(tab === 'All' || tab === 'Players') && players?.length > 0 && (
            <section className="search-section">
              <div className="search-section__head">
                <FiUser size={16} className="search-section__icon" />
                <h2>Players ({players.length})</h2>
              </div>
              <div className="search-section__grid search-section__grid--players">
                {players.slice(0, 8).map((p) => <PlayerCard key={p.id} player={p} />)}
              </div>
            </section>
          )}

          {(tab === 'All' || tab === 'Teams') && matchedTeams.length > 0 && (
            <section className="search-section">
              <div className="search-section__head">
                <FiShield size={16} className="search-section__icon" />
                <h2>Teams ({matchedTeams.length})</h2>
              </div>
              <div className="search-teams-list">
                {matchedTeams.map((t) => (
                  <Link key={t.name} to={`/teams/${encodeURIComponent(t.name)}`} className="search-team-item glass-card">
                    <span className="search-team-item__flag">{getTeamFlag(t.flagCode)}</span>
                    <span className="search-team-item__name">{t.name}</span>
                    <span className="search-team-item__status">{t.status}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(tab === 'All' || tab === 'Matches') && matches.length > 0 && (
            <section className="search-section">
              <div className="search-section__head">
                <FiCalendar size={16} className="search-section__icon" />
                <h2>Matches ({matches.length})</h2>
              </div>
              <div className="search-section__grid">
                {matches.slice(0, 6).map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            </section>
          )}

          {(tab === 'All' || tab === 'Series') && series.length > 0 && (
            <section className="search-section">
              <div className="search-section__head">
                <FiAward size={16} className="search-section__icon" />
                <h2>Series ({series.length})</h2>
              </div>
              <div className="search-section__grid">
                {series.slice(0, 6).map((s) => <SeriesCard key={s.id} series={s} />)}
              </div>
            </section>
          )}

          {(tab === 'All' || tab === 'News') && news.length > 0 && (
            <section className="search-section">
              <div className="search-section__head">
                <FiFileText size={16} className="search-section__icon" />
                <h2>News Articles ({news.length})</h2>
              </div>
              <div className="search-section__grid">
                {news.slice(0, 6).map((n) => <NewsCard key={n.id} article={n} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
