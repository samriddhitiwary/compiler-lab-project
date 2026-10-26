import { setDisplay } from '../algorithms/syntaxTreeAttributes'

export default function FollowposTable({ followpos, positionToSymbol, steps }) {
  if (!followpos) return null
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="stage-label">Stage G</p>
          <h2>followpos Table</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Position</th>
              <th>Symbol</th>
              <th>followpos</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(positionToSymbol).map(([position, symbol]) => (
              <tr key={position}>
                <td>{position}</td>
                <td>{symbol}</td>
                <td>{setDisplay(followpos[position])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>followpos Update Steps</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Node</th>
              <th>Rule</th>
              <th>Position</th>
              <th>Added</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, index) => (
              <tr key={`${step.nodeId}-${index}`}>
                <td>{step.nodeType}</td>
                <td>{step.rule}</td>
                <td>{step.affectedPosition}</td>
                <td>{setDisplay(step.addedPositions)}</td>
                <td>{setDisplay(step.after)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
