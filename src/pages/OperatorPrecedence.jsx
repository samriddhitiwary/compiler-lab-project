import { useMemo, useState } from 'react'
import ComputationExplanation from '../components/ComputationExplanation'
import ConflictAlert from '../components/ConflictAlert'
import GrammarInput from '../components/GrammarInput'
import GrammarValidation from '../components/GrammarValidation'
import LeadingTrailingTable from '../components/LeadingTrailingTable'
import PrecedenceTable from '../components/PrecedenceTable'
import ProjectStatus from '../components/ProjectStatus'
import StageIndicator from '../components/StageIndicator'
import StepControls from '../components/StepControls'
import { computeLeading } from '../algorithms/leading'
import { computeTrailing } from '../algorithms/trailing'
import { parseGrammar } from '../algorithms/grammarParser'
import { buildPrecedenceTable, generatePrecedenceSteps } from '../algorithms/precedenceTable'
import { validateOperatorGrammar } from '../algorithms/grammarValidator'
import { sampleGrammars, testCases } from '../data/sampleGrammars'

function emptySets(nonTerminals) {
  return Object.fromEntries(nonTerminals.map((symbol) => [symbol, []]))
}

function setsAtStep(nonTerminals, result, stepIndex) {
  if (!result || stepIndex === 0) {
    return emptySets(nonTerminals)
  }

  if (stepIndex >= result.steps.length) {
    return result.sets
  }

  return {
    ...emptySets(nonTerminals),
    ...result.steps[stepIndex - 1].snapshot,
  }
}

export default function OperatorPrecedence() {
  const [grammarText, setGrammarText] = useState(sampleGrammars.validExpression)
  const [startSymbol, setStartSymbol] = useState('')
  const [parseResult, setParseResult] = useState(null)
  const [validation, setValidation] = useState(null)
  const [leadingResult, setLeadingResult] = useState(null)
  const [trailingResult, setTrailingResult] = useState(null)
  const [precedenceSteps, setPrecedenceSteps] = useState([])
  const [leadingStepIndex, setLeadingStepIndex] = useState(0)
  const [trailingStepIndex, setTrailingStepIndex] = useState(0)
  const [relationStepIndex, setRelationStepIndex] = useState(0)

  const parsedForSelect = useMemo(() => parseGrammar(grammarText), [grammarText])
  const grammar = parseResult?.ok ? parseResult.grammar : null
  const nonTerminals = grammar?.nonTerminals || parsedForSelect.grammar.nonTerminals || []

  const resetResults = () => {
    setParseResult(null)
    setValidation(null)
    setLeadingResult(null)
    setTrailingResult(null)
    setPrecedenceSteps([])
    setLeadingStepIndex(0)
    setTrailingStepIndex(0)
    setRelationStepIndex(0)
  }

  const updateGrammarText = (value) => {
    setGrammarText(value)
    resetResults()
  }

  const loadSample = (key) => {
    setGrammarText(sampleGrammars[key])
    setStartSymbol('')
    resetResults()
  }

  const resetAll = () => {
    setGrammarText(sampleGrammars.validExpression)
    setStartSymbol('')
    resetResults()
  }

  const validateAndCompute = () => {
    const parsed = parseGrammar(grammarText, startSymbol)
    setParseResult(parsed)
    setLeadingStepIndex(0)
    setTrailingStepIndex(0)
    setRelationStepIndex(0)

    if (!parsed.ok) {
      setValidation(null)
      setLeadingResult(null)
      setTrailingResult(null)
      setPrecedenceSteps([])
      return
    }

    const checked = validateOperatorGrammar(parsed.grammar)
    setValidation(checked)

    if (!checked.ok) {
      setLeadingResult(null)
      setTrailingResult(null)
      setPrecedenceSteps([])
      return
    }

    const leading = computeLeading(parsed.grammar)
    const trailing = computeTrailing(parsed.grammar)
    const relationSteps = generatePrecedenceSteps(parsed.grammar, leading.sets, trailing.sets, parsed.grammar.startSymbol)

    setLeadingResult(leading)
    setTrailingResult(trailing)
    setPrecedenceSteps(relationSteps)
  }

  const leadingSets = setsAtStep(nonTerminals, leadingResult, leadingStepIndex)
  const trailingSets = setsAtStep(nonTerminals, trailingResult, trailingStepIndex)
  const tableState = grammar ? buildPrecedenceTable(grammar, precedenceSteps, relationStepIndex) : { symbols: [], table: {}, conflicts: [] }
  const activeLeadingStep = leadingStepIndex > 0 ? leadingResult?.steps[leadingStepIndex - 1] : null
  const activeTrailingStep = trailingStepIndex > 0 ? trailingResult?.steps[trailingStepIndex - 1] : null
  const activeRelationStep = relationStepIndex > 0 ? precedenceSteps[relationStepIndex - 1] : null
  const canUseStages = parseResult?.ok && validation?.ok

  return (
    <div className="opp-layout">
      <section className="title-strip">
        <div>
          <p className="eyebrow">Operator Precedence Parsing</p>
          <h2>Review-1 Functional Module</h2>
          <p>
            Enter an operator grammar, validate it, inspect LEADING/TRAILING insertions, and build the precedence relation table step by step.
          </p>
        </div>
      </section>

      <StageIndicator
        parseOk={Boolean(parseResult?.ok)}
        validationOk={Boolean(validation?.ok)}
        setsReady={Boolean(leadingResult && trailingResult)}
        tableReady={relationStepIndex === precedenceSteps.length && precedenceSteps.length > 0}
      />

      <GrammarInput
        grammarText={grammarText}
        setGrammarText={updateGrammarText}
        startSymbol={startSymbol}
        setStartSymbol={setStartSymbol}
        nonTerminals={parsedForSelect.grammar.nonTerminals}
        onValidate={validateAndCompute}
        onReset={resetAll}
        onLoadSample={loadSample}
      />

      <GrammarValidation parseResult={parseResult} validation={validation} />

      <section className={`panel ${!canUseStages ? 'disabled-panel' : ''}`}>
        <div className="panel-heading">
          <div>
            <p className="stage-label">Stage 3</p>
            <h2>LEADING and TRAILING Sets</h2>
          </div>
        </div>
        {!canUseStages && <p className="muted">This stage is enabled only after a valid operator grammar is accepted.</p>}
        {canUseStages && (
          <>
            <div className="split-grid">
              <div>
                <StepControls
                  label="LEADING Step"
                  index={leadingStepIndex}
                  total={leadingResult.steps.length}
                  disabled={!leadingResult}
                  onPrevious={() => setLeadingStepIndex((value) => Math.max(0, value - 1))}
                  onNext={() => setLeadingStepIndex((value) => Math.min(leadingResult.steps.length, value + 1))}
                  onAll={() => setLeadingStepIndex(leadingResult.steps.length)}
                  onReset={() => setLeadingStepIndex(0)}
                />
                <ComputationExplanation
                  title="LEADING Explanation"
                  step={activeLeadingStep}
                  emptyMessage="Use Next Step to begin LEADING computation."
                />
              </div>
              <div>
                <StepControls
                  label="TRAILING Step"
                  index={trailingStepIndex}
                  total={trailingResult.steps.length}
                  disabled={!trailingResult}
                  onPrevious={() => setTrailingStepIndex((value) => Math.max(0, value - 1))}
                  onNext={() => setTrailingStepIndex((value) => Math.min(trailingResult.steps.length, value + 1))}
                  onAll={() => setTrailingStepIndex(trailingResult.steps.length)}
                  onReset={() => setTrailingStepIndex(0)}
                />
                <ComputationExplanation
                  title="TRAILING Explanation"
                  step={activeTrailingStep}
                  emptyMessage="Use Next Step to begin TRAILING computation."
                />
              </div>
            </div>
            <LeadingTrailingTable
              nonTerminals={nonTerminals}
              leadingSets={leadingSets}
              trailingSets={trailingSets}
              activeStep={activeLeadingStep || activeTrailingStep}
            />
          </>
        )}
      </section>

      <section className={`panel ${!canUseStages ? 'disabled-panel' : ''}`}>
        <div className="panel-heading">
          <div>
            <p className="stage-label">Stage 4</p>
            <h2>Operator Precedence Table</h2>
          </div>
        </div>
        {!canUseStages && <p className="muted">Precedence table construction waits for successful grammar validation.</p>}
        {canUseStages && (
          <>
            <StepControls
              label="Relation Step"
              index={relationStepIndex}
              total={precedenceSteps.length}
              disabled={precedenceSteps.length === 0}
              onPrevious={() => setRelationStepIndex((value) => Math.max(0, value - 1))}
              onNext={() => setRelationStepIndex((value) => Math.min(precedenceSteps.length, value + 1))}
              onAll={() => setRelationStepIndex(precedenceSteps.length)}
              onReset={() => setRelationStepIndex(0)}
            />
            <ComputationExplanation
              title="Precedence Relation Explanation"
              step={activeRelationStep}
              emptyMessage="Use Next Step to insert precedence relations into the table."
            />
            <PrecedenceTable symbols={tableState.symbols} table={tableState.table} activeStep={activeRelationStep} />
            {relationStepIndex === precedenceSteps.length && <ConflictAlert conflicts={tableState.conflicts} />}
          </>
        )}
      </section>

      <section className="panel">
        <h2>Review-1 Test Grammars</h2>
        <div className="test-grid">
          {testCases.map((test) => (
            <article key={test.name} className="test-card">
              <h3>{test.name}</h3>
              <pre>{test.grammar}</pre>
              <p>{test.expected}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel muted-panel">
        <h2>String Parsing Module - Planned for Review 2</h2>
        <p>Shift/reduce input string parsing is intentionally outside the current Review-1 scope.</p>
      </section>

      <ProjectStatus />
    </div>
  )
}
