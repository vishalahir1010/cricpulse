import { useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import { searchPlayers, getPlayerDetails } from '../services/api/cricketApi';
import EmptyState from '../components/common/EmptyState';
import { RANKING_FORMATS } from '../utils/constants';
import './PlayerComparison.css';

function avatarFor(player) {
  return player.playerImg || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(player.name)}&backgroundType=gradientLinear`;
}

function PlayerPicker({ label, onSelect, selected }) {
  const [term, setTerm] = useState('');
  const debounced = useDebounce(term, 400);
  const { data: results } = useFetch(
    () => (debounced.trim() ? searchPlayers(debounced.trim()) : Promise.resolve([])),
    [debounced]
  );

  return (
    <div className="player-picker">
      <label>{label}</label>
      {selected ? (
        <div className="player-picker__selected">
          <img src={avatarFor(selected)} alt="" className="player-picker__avatar" />
          <span>{selected.name}</span>
          <button onClick={() => onSelect(null)}>Change</button>
        </div>
      ) : (
        <>
          <input
            placeholder="Search a player..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          {results?.length > 0 && (
            <ul className="player-picker__results">
              {results.slice(0, 6).map((p) => (
                <li key={p.id} onClick={() => onSelect(p)}>
                  <img src={avatarFor(p)} alt="" className="player-picker__avatar" />
                  <span className="player-picker__results-text">{p.name} <span>{p.country}</span></span>
                </li>
              ))}
            </ul>
          )}
        </>
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
  ['Average', 'Average'],
  ['Strike Rate', 'SR'],
  ['Hundreds', '100s'],
  ['Fifties', '50s'],
  ['Wickets', 'Wickets'],
  ['Economy', 'Economy'],
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
      <h1>Player Comparison</h1>

      <div className="comparison-page__pickers">
        <PlayerPicker label="Player A" selected={playerA} onSelect={setPlayerA} />
        <PlayerPicker label="Player B" selected={playerB} onSelect={setPlayerB} />
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
        <EmptyState title="Pick two players" message="Select a player on each side to see a side-by-side comparison." />
      ) : (
        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>
                  <img src={avatarFor(detailsA || playerA)} alt="" className="comparison-table__avatar" />
                  {detailsA?.name || playerA.name}
                </th>
                <th>Stat</th>
                <th>
                  <img src={avatarFor(detailsB || playerB)} alt="" className="comparison-table__avatar" />
                  {detailsB?.name || playerB.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, key]) => (
                <tr key={key}>
                  <td>{statsA?.[key] ?? '-'}</td>
                  <td className="comparison-table__label">{label}</td>
                  <td>{statsB?.[key] ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
