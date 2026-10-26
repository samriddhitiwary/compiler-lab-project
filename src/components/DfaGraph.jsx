import { setDisplay } from '../algorithms/syntaxTreeAttributes'

export default function DfaGraph({ dfa }) {
  if (!dfa) return null
  const width = Math.max(760, dfa.states.length * 170)
  const height = 300
  const positions = Object.fromEntries(
    dfa.states.map((state, index) => {
      const x = 90 + index * 150
      const y = index % 2 === 0 ? 115 : 205
      return [state.name, { x, y }]
    }),
  )

  const edges = []
  Object.entries(dfa.transitions).forEach(([from, row]) => {
    Object.entries(row).forEach(([symbol, to]) => edges.push({ from, to, symbol }))
  })

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="stage-label">Stage J</p>
          <h2>DFA Visualization</h2>
        </div>
      </div>
      <div className="dfa-graph-wrap">
        <svg width={width} height={height} role="img" aria-label="DFA graph">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3158b7" />
            </marker>
          </defs>
          <line x1="20" y1={positions.D0?.y || 115} x2="52" y2={positions.D0?.y || 115} stroke="#3158b7" strokeWidth="2" markerEnd="url(#arrowhead)" />
          {edges.map((edge, index) => {
            const from = positions[edge.from]
            const to = positions[edge.to]
            if (edge.from === edge.to) {
              return (
                <g key={`${edge.from}-${edge.symbol}-${index}`}>
                  <path d={`M ${from.x - 22} ${from.y - 38} C ${from.x - 65} ${from.y - 92}, ${from.x + 65} ${from.y - 92}, ${from.x + 22} ${from.y - 38}`} fill="none" stroke="#3158b7" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  <text x={from.x} y={from.y - 82} textAnchor="middle" className="edge-label">
                    {edge.symbol}
                  </text>
                </g>
              )
            }
            const midX = (from.x + to.x) / 2
            const midY = (from.y + to.y) / 2 - 18
            return (
              <g key={`${edge.from}-${edge.to}-${edge.symbol}-${index}`}>
                <line x1={from.x + 42} y1={from.y} x2={to.x - 42} y2={to.y} stroke="#3158b7" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x={midX} y={midY} textAnchor="middle" className="edge-label">
                  {edge.symbol}
                </text>
              </g>
            )
          })}
          {dfa.states.map((state) => {
            const point = positions[state.name]
            return (
              <g key={state.name}>
                <circle cx={point.x} cy={point.y} r="38" fill="#edf4ff" stroke="#3158b7" strokeWidth="2" />
                {state.isFinal && <circle cx={point.x} cy={point.y} r="32" fill="none" stroke="#3158b7" strokeWidth="2" />}
                <text x={point.x} y={point.y - 4} textAnchor="middle" className="state-label">
                  {state.name}
                </text>
                <text x={point.x} y={point.y + 16} textAnchor="middle" className="state-set-label">
                  {setDisplay(state.positions)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </section>
  )
}
