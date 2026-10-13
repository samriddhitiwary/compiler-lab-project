export default function ParsingTrace({ steps }) {
  if (!steps?.length) {
    return <p className="muted">The parsing trace appears after parsing starts.</p>
  }

  return (
    <>
      <h3 className="trace-heading">Parsing Trace</h3>
      <div className="table-wrap">
        <table className="trace-table">
          <thead>
            <tr>
              <th>Step</th>
              <th>Stack</th>
              <th>Top Terminal</th>
              <th>Relation</th>
              <th>Remaining Input</th>
              <th>Action</th>
              <th>Handle / Production</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step) => (
              <tr key={step.stepNumber}>
                <td>{step.stepNumber}</td>
                <td>{step.stackBefore.join(' ')}</td>
                <td>{step.topTerminal}</td>
                <td>
                  {step.topTerminal} {step.relation} {step.nextInput}
                </td>
                <td>{step.remainingInputBefore.join(' ')}</td>
                <td className={step.action === 'SHIFT' ? 'shift-action' : 'reduce-action'}>{step.action}</td>
                <td>{step.production || step.shiftedSymbol || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
