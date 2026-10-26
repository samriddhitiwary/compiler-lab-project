export default function RegexSteps({ result }) {
  if (!result) {
    return <p className="muted">Build a DFA to see tokenization, concatenation, augmentation, and postfix conversion.</p>
  }

  if (!result.ok) {
    return (
      <div className="alert error">
        <h3>Invalid Regular Expression</h3>
        {result.validation.errors.map((error, index) => (
          <p key={`${error.position}-${index}`}>
            Position {error.position}, Token {error.token || 'empty'}: {error.reason}
          </p>
        ))}
      </div>
    )
  }

  const rows = [
    ['Tokens', result.validation.tokens.map((token) => token.value).join(' ')],
    ['Explicit Concatenation', result.explicitTokens.map((token) => token.value).join(' ')],
    ['Augmented RE', result.augmentedTokens.map((token) => token.value).join(' ')],
    ['Postfix Expression', result.postfix.map((token) => token.value).join(' ')],
    ['End Marker Position', result.hashPosition],
  ]
  const hasStar = result.validation.tokens.some((token) => token.value === '*')

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="stage-label">Stages B-D</p>
          <h2>Validation, Augmentation, and Postfix Conversion</h2>
        </div>
      </div>
      <div className="info-grid">
        {rows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      {hasStar && (
        <div className="rule-callout">
          <h3>Kleene Closure Rule</h3>
          <p>For R*: nullable(R*) = true, firstpos(R*) = firstpos(R), and lastpos(R*) = lastpos(R).</p>
          <p>For every i in lastpos(R), add firstpos(R) to followpos(i).</p>
        </div>
      )}
      <h3>Postfix Conversion Steps</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Action</th>
              <th>Operator Stack</th>
              <th>Output</th>
            </tr>
          </thead>
          <tbody>
            {result.postfixSteps.map((step, index) => (
              <tr key={`${step.token}-${index}`}>
                <td>{step.token}</td>
                <td>{step.action}</td>
                <td>{step.operatorStack.join(' ') || '∅'}</td>
                <td>{step.output.join(' ') || '∅'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
