export default function ComputationExplanation({ title, step, emptyMessage }) {
  return (
    <div className="explanation">
      <h3>{title}</h3>
      {step ? (
        <>
          <p className="code-line">{step.production}</p>
          <dl>
            <dt>Rule</dt>
            <dd>{step.rule}</dd>
            <dt>Action</dt>
            <dd>
              {step.type ? `Add "${step.symbol}" to ${step.type}(${step.nonTerminal})` : `Insert ${step.left} ${step.relation} ${step.right}`}
            </dd>
            <dt>Reason</dt>
            <dd>{step.explanation}</dd>
          </dl>
        </>
      ) : (
        <p className="muted">{emptyMessage}</p>
      )}
    </div>
  )
}
