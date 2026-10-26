import { setDisplay } from '../algorithms/syntaxTreeAttributes'

export default function DfaTransitionTable({ dfa }) {
  if (!dfa) return null

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="stage-label">Stage I</p>
          <h2>DFA Transition Table</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>State</th>
              <th>Position Set</th>
              {dfa.alphabet.map((symbol) => (
                <th key={symbol}>{symbol}</th>
              ))}
              <th>Final?</th>
            </tr>
          </thead>
          <tbody>
            {dfa.states.map((state) => (
              <tr key={state.name} className={state.isFinal ? 'final-state-row' : ''}>
                <td>
                  {state.isStart ? '→' : ''}
                  {state.isFinal ? '*' : ''}
                  {state.name}
                </td>
                <td>{setDisplay(state.positions)}</td>
                {dfa.alphabet.map((symbol) => (
                  <td key={symbol}>{dfa.transitions[state.name]?.[symbol] || '-'}</td>
                ))}
                <td>{state.isFinal ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
