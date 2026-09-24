import './PlayerStatsTable.css';

// `statsByFormat` = [{ format: 'Test'|'ODI'|'T20', matches, runs, avg, sr, hundreds, fifties, wickets }]
export default function PlayerStatsTable({ statsByFormat }) {
  if (!statsByFormat?.length) return null;

  return (
    <div className="player-stats-wrap">
      <table className="player-stats-table">
        <thead>
          <tr>
            <th>Format</th>
            <th>M</th>
            <th>Runs</th>
            <th>Avg</th>
            <th>SR</th>
            <th>100s</th>
            <th>50s</th>
            {statsByFormat.some((s) => s.wickets != null) && <th>Wkts</th>}
          </tr>
        </thead>
        <tbody>
          {statsByFormat.map((s) => (
            <tr key={s.format}>
              <td className="player-stats-table__format">{s.format}</td>
              <td>{s.matches ?? '-'}</td>
              <td>{s.runs ?? '-'}</td>
              <td>{s.avg ?? '-'}</td>
              <td>{s.sr ?? '-'}</td>
              <td>{s.hundreds ?? '-'}</td>
              <td>{s.fifties ?? '-'}</td>
              {statsByFormat.some((x) => x.wickets != null) && <td>{s.wickets ?? '-'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
