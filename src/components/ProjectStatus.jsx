export default function ProjectStatus() {
  const review1 = [
    'Grammar parsing',
    'Operator grammar validation',
    'LEADING computation',
    'TRAILING computation',
    'Precedence table construction',
    'Conflict detection',
  ]

  const review2 = [
    'Input tokenization',
    'Step-by-step shift/reduce parser',
    'Topmost terminal detection',
    'Handle boundary detection',
    'Handle reduction',
    'Production matching',
    'Parsing trace',
    'ACCEPT/REJECT result',
    'Detailed error handling',
    'Multiple input-string test cases',
    'Parser loop protection',
    'Unit tests',
  ]

  const planned = [
    'RE syntax tree',
    'Augmented RE with #',
    'nullable',
    'firstpos',
    'lastpos',
    'followpos',
    'Direct DFA construction',
    'DFA transition table',
    'DFA visualization',
  ]

  return (
    <section className="panel status-panel">
      <h2>Review 2 Status</h2>
      <div className="status-grid">
        <div>
          <h3>Completed in Review 1</h3>
          <ul className="check-list">
            {review1.map((item) => (
              <li key={item}>✓ {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Completed in Review 2</h3>
          <ul className="check-list">
            {review2.map((item) => (
              <li key={item}>✓ {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Planned for Review 3</h3>
          <ul>
            {planned.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
