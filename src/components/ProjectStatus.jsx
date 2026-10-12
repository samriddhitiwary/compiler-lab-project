export default function ProjectStatus() {
  const completed = [
    'UI structure',
    'Grammar parsing',
    'Operator grammar validation',
    'LEADING computation',
    'TRAILING computation',
    'Step-by-step set visualization',
    'Operator precedence table construction',
    'Step-by-step relation insertion',
    'Conflict detection',
    'Multiple grammar test cases',
  ]

  const planned = [
    'Step-by-step shift/reduce string parsing',
    'Complete parsing trace',
    'ACCEPT/REJECT visualization',
    'Regular Expression to DFA using Direct Method',
    'Final integration and extensive testing',
  ]

  return (
    <section className="panel status-panel">
      <h2>Review 1 Status</h2>
      <div className="status-grid">
        <div>
          <h3>Completed</h3>
          <ul className="check-list">
            {completed.map((item) => (
              <li key={item}>✓ {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>In Progress</h3>
          <ul>
            <li>Integration testing</li>
            <li>UI refinement</li>
          </ul>
        </div>
        <div>
          <h3>Planned for Future Reviews</h3>
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
