export default function StringInput({ inputString, setInputString, tokens, onParse, disabled, reason }) {
  return (
    <div className="string-input">
      <label className="field-label" htmlFor="parser-input">
        Input String
      </label>
      <div className="parser-input-row">
        <input
          id="parser-input"
          value={inputString}
          onChange={(event) => setInputString(event.target.value)}
          placeholder="i+i*i or id + id * id"
          disabled={disabled}
        />
        <button type="button" className="primary" onClick={onParse} disabled={disabled}>
          Parse String
        </button>
      </div>
      {tokens?.length > 0 && <p className="token-preview">Tokens: {tokens.join(' ')}</p>}
      {disabled && reason && <p className="muted">{reason}</p>}
    </div>
  )
}
