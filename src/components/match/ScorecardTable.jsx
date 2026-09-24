import './ScorecardTable.css';

// `inning` follows CricAPI match_scorecard shape:
// { inning: 'Team Name Inning 1', batting: [...], bowling: [...] }
export default function ScorecardTable({ inning }) {
  if (!inning) return null;

  return (
    <div className="scorecard-inning">
      <h3 className="scorecard-inning__title">{inning.inning}</h3>

      <div className="scorecard-table-wrap">
        <table className="scorecard-table">
          <thead>
            <tr>
              <th>Batter</th>
              <th>R</th>
              <th>B</th>
              <th>4s</th>
              <th>6s</th>
              <th>SR</th>
            </tr>
          </thead>
          <tbody>
            {(inning.batting || []).map((b, i) => (
              <tr key={i}>
                <td>
                  <span className="scorecard-table__name">{b.batsman?.name}</span>
                  {b.dismissal && <span className="scorecard-table__dismissal">{b.dismissal}</span>}
                </td>
                <td>{b.r}</td>
                <td>{b.b}</td>
                <td>{b['4s']}</td>
                <td>{b['6s']}</td>
                <td>{b.sr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="scorecard-table-wrap">
        <table className="scorecard-table">
          <thead>
            <tr>
              <th>Bowler</th>
              <th>O</th>
              <th>M</th>
              <th>R</th>
              <th>W</th>
              <th>Econ</th>
            </tr>
          </thead>
          <tbody>
            {(inning.bowling || []).map((b, i) => (
              <tr key={i}>
                <td className="scorecard-table__name">{b.bowler?.name}</td>
                <td>{b.o}</td>
                <td>{b.m}</td>
                <td>{b.r}</td>
                <td>{b.w}</td>
                <td>{b.eco}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
