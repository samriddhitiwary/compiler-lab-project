import ParserStack from './ParserStack'

export default function ParseExplanation({ step }) {
  if (!step) {
    return <p className="muted">Use Next Step after parsing to inspect stack, relation, action, and explanation.</p>
  }

  return (
    <div className="parse-step-card">
      <div>
        <p className="stage-label">Stack Before</p>
        <ParserStack
          stack={step.stackBefore}
          handle={step.action === 'REDUCE' ? step.handle : []}
          handleStartIndex={step.handleStartIndex}
          topTerminal={step.topTerminal}
        />
      </div>
      <div className="parse-facts">
        <div>
          <span>Relation</span>
          <strong>
            {step.topTerminal} {step.relation} {step.nextInput}
          </strong>
        </div>
        <div>
          <span>Input</span>
          <strong>{step.remainingInputBefore.join(' ')}</strong>
        </div>
        <div>
          <span>Action</span>
          <strong>{step.action}</strong>
        </div>
        <div>
          <span>Handle</span>
          <strong>{step.handle?.join(' ') || '-'}</strong>
        </div>
        <div>
          <span>Production</span>
          <strong>{step.production || '-'}</strong>
        </div>
      </div>
      <p>{step.explanation}</p>
      <div>
        <p className="stage-label">Stack After</p>
        <ParserStack stack={step.stackAfter} />
      </div>
    </div>
  )
}
