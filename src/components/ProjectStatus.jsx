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
    'Additional styling polish',
    'More large-expression stress tests',
  ]

  const review3 = [
    'RE input and validation',
    'Explicit concatenation',
    'Augmented RE with #',
    'Postfix conversion',
    'Syntax tree',
    'Polished SVG tree layout',
    'Tree zoom and node details',
    'Kleene closure input support',
    'Nested Kleene closure support',
    'nullable',
    'firstpos',
    'lastpos',
    'followpos',
    'STAR nullable/firstpos/lastpos rules',
    'STAR followpos rule',
    'Direct DFA construction',
    'Transition table',
    'DFA visualization',
    'DFA string simulation',
    'Empty-string DFA testing',
    'Final integration',
    'Automated tests',
  ]

  return (
    <section className="panel status-panel">
      <h2>Final Project Status</h2>
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
          <h3>Completed in Review 3</h3>
          <ul className="check-list">
            {review3.map((item) => (
              <li key={item}>✓ {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Remaining Refinement</h3>
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
