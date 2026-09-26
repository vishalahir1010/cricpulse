import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import { searchPlayers, getPlayerDetails } from '../services/api/cricketApi';
import EmptyState from '../components/common/EmptyState';
import { RANKING_FORMATS } from '../utils/constants';
import { FiArrowLeft, FiSearch, FiX } from 'react-icons/fi';
import './PlayerComparison.css';

function avatarFor(player) {
  return player?.playerImg || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(player?.name || '')}&backgroundType=gradientLinear`;
}

function PlayerPicker({ label, onSelect, selected }) {
  const [term, setTerm] = useState('');
  const debounced = useDebounce(term, 400);
  const { data: results } = useFetch(
    () => (debounced.trim() ? searchPlayers(debounced.trim()) : Promise.resolve([])),
    [debounced]
  );

  return (
    <div className="player-picker glass-card">
      <label>{label}</label>
      {selected ? (
        <div className="player-picker__selected">
          <img src={avatarFor(selected)} alt="" className="player-picker__avatar" />
          <div className="player-picker__selected-info">
            <strong>{selected.name}</strong>
            <span>{selected.country || 'International'}</span>
          </div>
          <button className="player-picker__change-btn" onClick={() => onSelect(null)}>
            <FiX size={14} /> Change
          </button>
        </div>
      ) : (
        <div className="player-picker__input-wrap">
          <div className="player-picker__search-box">
            <FiSearch size={14} />
            <input
              placeholder="Search a player..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
          {results?.length > 0 && (
            <ul className="player-picker__results glass-card">
              {results.slice(0, 6).map((p) => (
                <li key={p.id} onClick={() => onSelect(p)}>
                  <img src={avatarFor(p)} alt="" className="player-picker__avatar" />
                  <span className="player-picker__results-text">
                    <strong>{p.name}</strong>
                    <span>{p.country}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function statsFor(player, format) {
  const bat = player?.battingStats?.[format.toLowerCase()] || {};
  const bowl = player?.bowlingStats?.[format.toLowerCase()] || {};
  return { ...bat, Wickets: bowl.Wickets, Economy: bowl.Economy };
}

const ROWS = [
  ['Matches', 'Matches'],
  ['Runs', 'Runs'],
  ['Batting Average', 'Average'],
  ['Strike Rate', 'SR'],
  ['Hundreds (100s)', '100s'],
  ['Fifties (50s)', '50s'],
  ['Wickets', 'Wickets'],
  ['Bowling Economy', 'Economy'],
];

export default function PlayerComparison() {
  const [playerA, setPlayerA] = useState(null);
  const [playerB, setPlayerB] = useState(null);
  const [format, setFormat] = useState('ODI');

  const { data: detailsA } = useFetch(
    () => (playerA ? getPlayerDetails(playerA.id) : Promise.resolve(null)),
    [playerA?.id]
  );
  const { data: detailsB } = useFetch(
    () => (playerB ? getPlayerDetails(playerB.id) : Promise.resolve(null)),
    [playerB?.id]
  );

  const statsA = detailsA ? statsFor(detailsA, format) : null;
  const statsB = detailsB ? statsFor(detailsB, format) : null;

  return (
    <div className="container comparison-page">
      <Link to="/players" className="match-details__back-link">
        <FiArrowLeft size={16} /> Back to Players
      </Link>

      <div className="page-header">
        <h1 className="page-title">Player Comparison</h1>
        <p className="page-subtitle">Compare career stats head-to-head across Test, ODI and T20 formats.</p>
      </div>

      <div className="comparison-page__pickers">
        <PlayerPicker label="Select Player A" selected={playerA} onSelect={setPlayerA} />
        <PlayerPicker label="Select Player B" selected={playerB} onSelect={setPlayerB} />
      </div>

      <div className="comparison-page__formats">
        {RANKING_FORMATS.map((f) => (
          <button
            key={f}
            className={`filter-chip${format === f ? ' filter-chip--active' : ''}`}
            onClick={() => setFormat(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {!playerA || !playerB ? (
        <EmptyState title="Pick two players" message="Select a player on each side to see a side-by-side career comparison." />
      ) : (
        <div className="comparison-table-wrap glass-card">
          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>
                  <img src={avatarFor(detailsA || playerA)} alt="" className="comparison-table__avatar" />
                  <span className="comparison-table__player-name">{detailsA?.name || playerA.name}</span>
                </th>
                <th style={{ width: '20%' }}>Metric</th>
                <th style={{ width: '40%' }}>
                  <img src={avatarFor(detailsB || playerB)} alt="" className="comparison-table__avatar" />
                  <span className="comparison-table__player-name">{detailsB?.name || playerB.name}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, key]) => (
                <tr key={key}>
                  <td className="comparison-table__val">{statsA?.[key] ?? '-'}</td>
                  <td className="comparison-table__label">{label}</td>
                  <td className="comparison-table__val">{statsB?.[key] ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
