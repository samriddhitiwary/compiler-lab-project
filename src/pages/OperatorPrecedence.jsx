import { useMemo, useState } from 'react'
import ComputationExplanation from '../components/ComputationExplanation'
import ConflictAlert from '../components/ConflictAlert'
import GrammarInput from '../components/GrammarInput'
import GrammarValidation from '../components/GrammarValidation'
import LeadingTrailingTable from '../components/LeadingTrailingTable'
import ParseExplanation from '../components/ParseExplanation'
import ParseResult from '../components/ParseResult'
import ParsingTrace from '../components/ParsingTrace'
import PrecedenceTable from '../components/PrecedenceTable'
import ProjectStatus from '../components/ProjectStatus'
import StageIndicator from '../components/StageIndicator'
import StepControls from '../components/StepControls'
import StringInput from '../components/StringInput'
import { computeLeading } from '../algorithms/leading'
import { computeTrailing } from '../algorithms/trailing'
import { prepareAndParse } from '../algorithms/operatorPrecedenceParser'
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
  const [inputString, setInputString] = useState('i+i*i')
  const [parseTraceResult, setParseTraceResult] = useState(null)
  const [parseStepIndex, setParseStepIndex] = useState(0)

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
    setParseTraceResult(null)
    setParseStepIndex(0)
  }

  const updateGrammarText = (value) => {
    setGrammarText(value)
    resetResults()
  }

  const loadSample = (key) => {
    setGrammarText(sampleGrammars[key])
    setInputString(key === 'multiCharacter' ? 'id + id * id' : 'i+i*i')
    setStartSymbol('')
    resetResults()
  }

  const resetAll = () => {
    setGrammarText(sampleGrammars.validExpression)
    setInputString('i+i*i')
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
  const fullTableState = grammar ? buildPrecedenceTable(grammar, precedenceSteps, precedenceSteps.length) : { symbols: [], table: {}, conflicts: [] }
  const activeLeadingStep = leadingStepIndex > 0 ? leadingResult?.steps[leadingStepIndex - 1] : null
  const activeTrailingStep = trailingStepIndex > 0 ? trailingResult?.steps[trailingStepIndex - 1] : null
  const activeRelationStep = relationStepIndex > 0 ? precedenceSteps[relationStepIndex - 1] : null
  const activeParseStep = parseStepIndex > 0 ? parseTraceResult?.steps[parseStepIndex - 1] : null
  const canUseStages = parseResult?.ok && validation?.ok
  const tableComplete = relationStepIndex === precedenceSteps.length && precedenceSteps.length > 0
  const canParseString = Boolean(canUseStages && tableComplete && fullTableState.conflicts.length === 0)
  const parseDisabledReason = !canUseStages
    ? 'Validate a correct operator grammar before parsing strings.'
    : !tableComplete
      ? 'Build the complete precedence table before parsing strings.'
      : fullTableState.conflicts.length > 0
        ? 'Parsing disabled because the precedence table contains conflicts.'
        : ''

  const runStringParser = () => {
    if (!grammar) {
      return
    }

    const result = prepareAndParse({
      grammar,
      inputText: inputString,
      precedenceTable: fullTableState.table,
      startSymbol: grammar.startSymbol,
      conflicts: fullTableState.conflicts,
    })
    setParseTraceResult(result)
    setParseStepIndex(0)
  }

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
        tableReady={tableComplete}
        parserReady={Boolean(parseTraceResult)}
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

      <section className={`panel ${!canParseString ? 'disabled-panel' : ''}`}>
        <div className="panel-heading">
          <div>
            <p className="stage-label">Stage 5</p>
            <h2>String Parsing</h2>
          </div>
        </div>
        <StringInput
          inputString={inputString}
          setInputString={(value) => {
            setInputString(value)
            setParseTraceResult(null)
            setParseStepIndex(0)
          }}
          tokens={parseTraceResult?.tokens}
          onParse={runStringParser}
          disabled={!canParseString}
          reason={parseDisabledReason}
        />
        {parseTraceResult && (
          <>
            <StepControls
              label="Parsing Step"
              index={parseStepIndex}
              total={parseTraceResult.steps.length}
              disabled={parseTraceResult.steps.length === 0}
              allLabel="Run All"
              onPrevious={() => setParseStepIndex((value) => Math.max(0, value - 1))}
              onNext={() => setParseStepIndex((value) => Math.min(parseTraceResult.steps.length, value + 1))}
              onAll={() => setParseStepIndex(parseTraceResult.steps.length)}
              onReset={() => setParseStepIndex(0)}
            />
            <ParseResult result={parseTraceResult} inputString={inputString} startSymbol={grammar.startSymbol} />
            <ParseExplanation step={activeParseStep} />
            <ParsingTrace steps={parseTraceResult.steps.slice(0, parseStepIndex)} />
          </>
        )}
      </section>

      <details className="panel">
        <summary>How Operator Precedence Parsing Works</summary>
        <ol className="viva-list">
          <li>Compare the topmost terminal on the stack with the next input terminal.</li>
          <li>If the relation is &lt; or =, shift the input terminal onto the stack.</li>
          <li>If the relation is &gt;, reduce by locating the nearest &lt; boundary on the stack.</li>
          <li>The handle includes non-terminals between those terminal boundaries.</li>
          <li>Match the handle against grammar productions, using exact matching first and operator-shape matching second.</li>
          <li>Replace the handle by the production left-hand side.</li>
          <li>Accept only when the input is exhausted and the stack represents the start symbol.</li>
        </ol>
      </details>

      <section className="panel">
        <h2>Review Test Grammars</h2>
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
        <h2>RE to DFA using Direct Method - Planned for Review 3</h2>
        <p>The direct-method DFA module is intentionally outside the current Review-2 scope.</p>
      </section>

      <ProjectStatus />
    </div>
  )
}
