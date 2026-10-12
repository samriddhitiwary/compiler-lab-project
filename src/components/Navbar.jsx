export default function Navbar({ activePage, setActivePage }) {
  return (
    <header className="site-header">
      <div>
        <p className="eyebrow">Project 8 | BCSE307P</p>
        <h1>Compiler Design Visualization Tool</h1>
        <p className="subtitle">Interactive Operator Precedence Parser</p>
      </div>
      <nav className="main-nav" aria-label="Main navigation">
        {['Home', 'Bottom-Up Parsing'].map((page) => (
          <button
            key={page}
            type="button"
            className={activePage === page ? 'active' : ''}
            onClick={() => setActivePage(page)}
          >
            {page}
          </button>
        ))}
      </nav>
    </header>
  )
}
