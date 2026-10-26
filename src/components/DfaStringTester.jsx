import { useState } from 'react'
import { simulateDfa } from '../algorithms/dfaSimulator'
import DfaSimulationTrace from './DfaSimulationTrace'

export default function DfaStringTester({ dfa }) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)

  if (!dfa) return null

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="stage-label">String Testing</p>
          <h2>Run DFA</h2>
        </div>
      </div>
      <label className="field-label" htmlFor="dfa-test-input">
        Test String
      </label>
      <div className="parser-input-row">
        <input
          id="dfa-test-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Leave empty to test ε"
        />
        <button type="button" className="primary" onClick={() => setResult(simulateDfa(dfa, input))}>
          Run DFA
        </button>
      </div>
      <p className="muted">Alphabet: {dfa.alphabet.join(', ') || '∅'}. Leave the box empty to test the empty string.</p>
      <DfaSimulationTrace result={result} />
    </section>
  )
}
