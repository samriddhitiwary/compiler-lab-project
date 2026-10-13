export default function GrammarInput({
  grammarText,
  setGrammarText,
  startSymbol,
  setStartSymbol,
  nonTerminals,
  onValidate,
  onReset,
  onLoadSample,
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="stage-label">Stage 1</p>
          <h2>Grammar Input</h2>
        </div>
      </div>

      <label className="field-label" htmlFor="grammar-input">
        Productions
      </label>
      <textarea
        id="grammar-input"
        value={grammarText}
        onChange={(event) => setGrammarText(event.target.value)}
        spellCheck="false"
        rows="7"
      />

      <div className="input-grid">
        <label className="field-label" htmlFor="start-symbol">
          Start Symbol
        </label>
        <select id="start-symbol" value={startSymbol} onChange={(event) => setStartSymbol(event.target.value)}>
          <option value="">Auto detect</option>
          {nonTerminals.map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>
      </div>

      <div className="button-row">
        <button type="button" onClick={() => onLoadSample('validExpression')}>
          Load Valid Sample
        </button>
        <button type="button" onClick={() => onLoadSample('invalidAdjacent')}>
          Load Invalid Sample
        </button>
        <button type="button" onClick={() => onLoadSample('conflict')}>
          Load Conflict Sample
        </button>
        <button type="button" onClick={() => onLoadSample('multiCharacter')}>
          Load Multi-Char Sample
        </button>
        <button type="button" className="primary" onClick={onValidate}>
          Validate Grammar
        </button>
        <button type="button" className="ghost" onClick={onReset}>
          Reset
        </button>
      </div>
    </section>
  )
}
