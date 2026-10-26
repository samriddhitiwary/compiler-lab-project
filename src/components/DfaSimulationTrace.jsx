export default function DfaSimulationTrace({ result }) {
  if (!result) return null
  return (
    <div className={`alert ${result.accepted ? 'success' : 'error'}`}>
      <h3>{result.accepted ? 'Input Accepted' : 'Input Rejected'}</h3>
      <p>{result.reason}</p>
      {result.trace.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Step</th>
                <th>Current State</th>
                <th>Input Symbol</th>
                <th>Next State</th>
              </tr>
            </thead>
            <tbody>
              {result.trace.map((step) => (
                <tr key={step.step}>
                  <td>{step.step}</td>
                  <td>{step.currentState}</td>
                  <td>{step.symbol}</td>
                  <td>{step.nextState}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
