export default function Home({ onOpenModule }) {
  return (
    <main className="page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Samriddhi Tiwary | 23BCE0661 | SCOPE</p>
          <h2>Interactive GUI for Operator Precedence Parsing</h2>
          <p>
            A Review-1 implementation for Compiler Design Lab focused on grammar validation,
            LEADING/TRAILING computation, and operator precedence table construction.
          </p>
          <button type="button" className="primary" onClick={onOpenModule}>
            Open Bottom-Up Parsing
          </button>
        </div>
        <div className="project-card">
          <h3>Review-1 Scope</h3>
          <p>Implemented: Operator Precedence Parsing visualization.</p>
          <p>Not included: LR parsing, shift/reduce string parsing, and RE to DFA direct method.</p>
        </div>
      </section>
    </main>
  )
}
