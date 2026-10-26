import { setDisplay } from '../algorithms/syntaxTreeAttributes'

export default function DfaConstructionSteps({ steps }) {
  if (!steps?.length) return null

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="stage-label">Stage H</p>
          <h2>DFA State Construction Steps</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Current State</th>
              <th>Symbol</th>
              <th>Matching Positions</th>
              <th>Union</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, index) => (
              <tr key={`${step.currentState}-${step.symbol}-${index}`}>
                <td>
                  {step.currentState} = {setDisplay(step.statePositions)}
                </td>
                <td>{step.symbol}</td>
                <td>{setDisplay(step.matchingPositions)}</td>
                <td>{setDisplay(step.union)}</td>
                <td>{step.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
