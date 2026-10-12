function formatSet(values = []) {
  return values.length ? `{ ${values.join(', ')} }` : '∅'
}

export default function LeadingTrailingTable({ nonTerminals, leadingSets, trailingSets, activeStep }) {
  return (
    <div className="table-wrap">
      <table className="sets-table">
        <thead>
          <tr>
            <th>Non-Terminal</th>
            <th>LEADING</th>
            <th>TRAILING</th>
          </tr>
        </thead>
        <tbody>
          {nonTerminals.map((nonTerminal) => (
            <tr key={nonTerminal} className={activeStep?.nonTerminal === nonTerminal ? 'row-highlight' : ''}>
              <td>{nonTerminal}</td>
              <td className={activeStep?.type === 'LEADING' && activeStep.nonTerminal === nonTerminal ? 'cell-highlight' : ''}>
                {formatSet(leadingSets[nonTerminal])}
              </td>
              <td className={activeStep?.type === 'TRAILING' && activeStep.nonTerminal === nonTerminal ? 'cell-highlight' : ''}>
                {formatSet(trailingSets[nonTerminal])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
