export default function RegexInput({ regex, setRegex, onBuild, onSample, onReset }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="stage-label">Stage A</p>
          <h2>Regular Expression Input</h2>
        </div>
      </div>
      <label className="field-label" htmlFor="regex-input">
        Regular Expression
      </label>
      <div className="parser-input-row">
        <input
          id="regex-input"
          value={regex}
          onChange={(event) => setRegex(event.target.value)}
          placeholder="(a|b)*abb"
        />
        <button type="button" className="primary" onClick={onBuild}>
          Build DFA
        </button>
      </div>
      <p className="stage-label sample-label">Regular Expression Samples</p>
      <div className="button-row regex-samples">
        {['a', 'a*', 'a|b', 'ab', '(a|b)*', '(a|b)*abb', 'a(b|c)*', '(ab)*', 'a**', 'a|ε'].map((sample) => (
          <button key={sample} type="button" onClick={() => onSample(sample)}>
            {sample}
          </button>
        ))}
        <button type="button" className="ghost" onClick={onReset}>
          Reset
        </button>
      </div>
    </section>
  )
}
