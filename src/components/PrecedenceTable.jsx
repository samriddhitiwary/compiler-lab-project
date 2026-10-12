export default function PrecedenceTable({ symbols, table, activeStep }) {
  if (!symbols.length) {
    return <p className="muted">The precedence table appears after LEADING and TRAILING are available.</p>
  }

  return (
    <div className="table-wrap">
      <table className="precedence-table">
        <thead>
          <tr>
            <th></th>
            {symbols.map((symbol) => (
              <th key={symbol}>{symbol}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {symbols.map((row) => (
            <tr key={row}>
              <th>{row}</th>
              {symbols.map((column) => {
                const cell = table[row]?.[column]
                const active = activeStep?.left === row && activeStep?.right === column
                return (
                  <td key={column} className={`${cell?.conflict ? 'conflict-cell' : ''} ${active ? 'relation-highlight' : ''}`}>
                    {cell?.relations?.join(', ') || ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
