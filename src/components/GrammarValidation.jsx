export default function GrammarValidation({ parseResult, validation }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="stage-label">Stage 2</p>
          <h2>Operator Grammar Validation</h2>
        </div>
      </div>

      {!parseResult && <p className="muted">Validate the grammar to see syntax and operator grammar checks.</p>}

      {parseResult && !parseResult.ok && (
        <div className="alert error">
          <h3>Invalid Grammar Syntax</h3>
          <ul>
            {parseResult.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {parseResult?.ok && validation && (
        <div className={`alert ${validation.ok ? 'success' : 'error'}`}>
          <h3>{validation.ok ? 'Valid Operator Grammar' : 'Invalid Operator Grammar'}</h3>
          {validation.ok ? (
            <ul>
              {validation.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : (
            validation.errors.map((error, index) => (
              <div className="reason-block" key={`${error.type}-${index}`}>
                {error.production && <p className="code-line">Production: {error.production}</p>}
                <p>Reason: {error.reason}</p>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  )
}
