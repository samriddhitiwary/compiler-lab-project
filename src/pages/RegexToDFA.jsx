import { useState } from 'react'
import AttributeTable from '../components/AttributeTable'
import DfaConstructionSteps from '../components/DfaConstructionSteps'
import DfaGraph from '../components/DfaGraph'
import DfaStringTester from '../components/DfaStringTester'
import DfaTransitionTable from '../components/DfaTransitionTable'
import FollowposTable from '../components/FollowposTable'
import RegexInput from '../components/RegexInput'
import RegexSteps from '../components/RegexSteps'
import SyntaxTreeView from '../components/SyntaxTreeView'
import StepControls from '../components/StepControls'
import { buildRegexDirectMethod } from '../algorithms/regexDirectMethod'

export default function RegexToDFA() {
  const [regex, setRegex] = useState('(a|b)*abb')
  const [result, setResult] = useState(null)
  const [stage, setStage] = useState(0)

  const build = () => {
    try {
      setResult(buildRegexDirectMethod(regex))
      setStage(0)
    } catch (error) {
      setResult({
        ok: false,
        validation: {
          errors: [{ position: 0, token: '', reason: error.message }],
        },
      })
      setStage(0)
    }
  }

  return (
    <main className="page">
      <section className="title-strip">
        <div>
          <p className="eyebrow">Regular Expression to DFA</p>
          <h2>Direct Method Visualization</h2>
          <p>
            Build the augmented syntax tree, compute nullable, firstpos, lastpos, followpos, construct DFA states directly,
            and test strings on the generated DFA.
          </p>
        </div>
      </section>

      <RegexInput
        regex={regex}
        setRegex={(value) => {
          setRegex(value)
          setResult(null)
          setStage(0)
        }}
        onBuild={build}
        onSample={(sample) => {
          setRegex(sample)
          setResult(null)
          setStage(0)
        }}
        onReset={() => {
          setRegex('(a|b)*abb')
          setResult(null)
          setStage(0)
        }}
      />

      {(!result?.ok || !result) && <RegexSteps result={result} />}

      {result?.ok && (
        <>
          <section className="panel stage-progress-panel">
            <StepControls
              label="Direct Method stage"
              index={stage}
              total={8}
              onPrevious={() => setStage((value) => Math.max(0, value - 1))}
              onNext={() => setStage((value) => Math.min(8, value + 1))}
              onAll={() => setStage(8)}
              onReset={() => setStage(0)}
            />
            <p className="muted">Reveal the algorithm from validation through DFA simulation, or compute all stages at once.</p>
          </section>
          {stage >= 1 && <RegexSteps result={result} />}
          {stage >= 2 && <SyntaxTreeView root={result.tree} />}
          {stage >= 3 && <AttributeTable nodes={result.treeNodes} />}
          {stage >= 4 && <FollowposTable followpos={result.followpos} positionToSymbol={result.positionToSymbol} steps={result.followSteps} />}
          {stage >= 5 && <DfaConstructionSteps steps={result.dfa.steps} />}
          {stage >= 6 && <DfaTransitionTable dfa={result.dfa} />}
          {stage >= 7 && <DfaGraph dfa={result.dfa} />}
          {stage >= 8 && <DfaStringTester dfa={result.dfa} />}
        </>
      )}
    </main>
  )
}
