export default function Home({ onOpenParsing, onOpenRegex }) {
  return (
    <main className="page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Samriddhi Tiwary | 23BCE0661 | SCOPE</p>
          <h2>Interactive GUI for Operator Precedence Parsing and RE to DFA</h2>
          <p>
            A Compiler Design Lab project with bottom-up operator-precedence parsing and direct-method DFA construction
            from regular expressions.
          </p>
          <div className="button-row">
            <button type="button" className="primary" onClick={onOpenParsing}>
              Open Bottom-Up Parsing
            </button>
            <button type="button" onClick={onOpenRegex}>
              Open RE to DFA
            </button>
          </div>
        </div>
        <div className="project-card">
          <h3>Review 3 Scope</h3>
          <p>Implemented: Operator Precedence Parsing and RE to DFA using the Direct Method.</p>
          <p>Includes syntax-tree attributes, followpos, DFA graph, and string testing.</p>
        </div>
      </section>
    </main>
  )
}
