import { extractSymbols, formatSymbols } from './symbolUtils.js'
import { tokenizeInput } from './inputTokenizer.js'
import {
  extractHandle,
  findHandleBoundary,
  findTopmostTerminal,
  getPrecedenceRelation,
  stackToDisplay,
  toStackSymbol,
} from './handleFinder.js'
import { formatMatchedProduction, matchHandleToProductions } from './productionMatcher.js'
import { buildUnitProductionClosure, canRepresentStart } from './unitProductionUtils.js'

export function validateParserPreconditions({ grammar, precedenceTable, conflicts, inputText }) {
  const errors = []

  if (!grammar) {
    errors.push('Grammar has not been parsed successfully.')
  }

  if (conflicts?.length) {
    errors.push('Parsing disabled because the precedence table contains conflicting relations.')
  }

  if (!inputText.trim()) {
    errors.push('Input string is empty.')
  }

  if (inputText.includes('$')) {
    errors.push('Input must not manually contain the end marker "$".')
  }

  if (!precedenceTable || Object.keys(precedenceTable).length === 0) {
    errors.push('Precedence table has not been generated.')
  }

  return errors
}

function makeStep({
  stepNumber,
  stackBefore,
  remainingInputBefore,
  topTerminal,
  nextInput,
  relation,
  action,
  shiftedSymbol = null,
  handle = null,
  handleStartIndex = null,
  production = null,
  stackAfter,
  remainingInputAfter,
  explanation,
}) {
  return {
    stepNumber,
    stackBefore: stackToDisplay(stackBefore),
    remainingInputBefore: [...remainingInputBefore],
    topTerminal,
    nextInput,
    relation,
    action,
    shiftedSymbol,
    handle: handle ? stackToDisplay(handle) : null,
    handleStartIndex,
    production: production ? formatMatchedProduction(production) : null,
    stackAfter: stackToDisplay(stackAfter),
    remainingInputAfter: [...remainingInputAfter],
    explanation,
  }
}

function acceptedByFinalStack(stack, inputIndex, input, startSymbol, unitClosure) {
  if (input[inputIndex] !== '$' || inputIndex !== input.length - 1 || stack.length !== 2) {
    return false
  }

  const candidate = stack[1]
  return candidate.type === 'nonterminal' && canRepresentStart(candidate.symbol, startSymbol, unitClosure)
}

function stateKey(stack, inputIndex) {
  return `${stack.map((item) => `${item.type}:${item.symbol}`).join(' ')}|${inputIndex}`
}

export function parseOperatorPrecedence({ grammar, inputTokens, precedenceTable, startSymbol, debug = false }) {
  const steps = []
  const stack = [toStackSymbol('$')]
  const input = [...inputTokens, '$']
  const unitClosure = buildUnitProductionClosure(grammar)
  const visited = new Set()
  const maxSteps = Math.max(100, 20 * inputTokens.length + 10 * grammar.rules.length)
  let inputIndex = 0
  let lastInputIndex = -1
  let repeatedWithoutProgress = 0

  for (let stepNumber = 0; stepNumber < maxSteps; stepNumber += 1) {
    if (acceptedByFinalStack(stack, inputIndex, input, startSymbol, unitClosure)) {
      return {
        accepted: true,
        steps,
        finalStack: stackToDisplay(stack),
        remainingInput: input.slice(inputIndex),
        reason: 'Input accepted.',
      }
    }

    const currentStateKey = stateKey(stack, inputIndex)
    if (visited.has(currentStateKey) && inputIndex === lastInputIndex) {
      return {
        accepted: false,
        steps,
        finalStack: stackToDisplay(stack),
        remainingInput: input.slice(inputIndex),
        reason: 'A non-progressing parser cycle was detected.',
      }
    }
    visited.add(currentStateKey)
    repeatedWithoutProgress = inputIndex === lastInputIndex ? repeatedWithoutProgress + 1 : 0
    lastInputIndex = inputIndex

    if (repeatedWithoutProgress > grammar.rules.length + input.length) {
      return {
        accepted: false,
        steps,
        finalStack: stackToDisplay(stack),
        remainingInput: input.slice(inputIndex),
        reason: 'Parser entered a non-progressing reduction cycle.',
      }
    }

    const topTerminal = findTopmostTerminal(stack)
    const nextInput = input[inputIndex]
    const stackBefore = stack.map((item) => ({ ...item }))
    const remainingInputBefore = input.slice(inputIndex)

    if (!topTerminal || !nextInput) {
      return {
        accepted: false,
        steps,
        finalStack: stackToDisplay(stack),
        remainingInput: input.slice(inputIndex),
        reason: 'Unexpected end of input while parsing.',
      }
    }

    const relationInfo = getPrecedenceRelation(precedenceTable, topTerminal.symbol, nextInput)
    if (relationInfo.conflict) {
      return {
        accepted: false,
        steps,
        finalStack: stackToDisplay(stack),
        remainingInput: input.slice(inputIndex),
        reason: `Conflicting precedence relations exist between "${topTerminal.symbol}" and "${nextInput}".`,
      }
    }

    const relation = relationInfo.relation
    if (!relation) {
      return {
        accepted: false,
        steps,
        finalStack: stackToDisplay(stack),
        remainingInput: input.slice(inputIndex),
        reason: `No precedence relation exists between "${topTerminal.symbol}" and "${nextInput}".`,
      }
    }

    if ((relation === '<' || relation === '=') && !(topTerminal.symbol === '$' && nextInput === '$')) {
      stack.push(toStackSymbol(nextInput))
      inputIndex += 1
      const explanation = `"${topTerminal.symbol}" ${relation} "${nextInput}", therefore shift "${nextInput}" onto the stack.`
      steps.push(
        makeStep({
          stepNumber,
          stackBefore,
          remainingInputBefore,
          topTerminal: topTerminal.symbol,
          nextInput,
          relation,
          action: 'SHIFT',
          shiftedSymbol: nextInput,
          stackAfter: stack,
          remainingInputAfter: input.slice(inputIndex),
          explanation,
        }),
      )

      if (debug) {
        console.debug({ stack: stackToDisplay(stack), input: input.slice(inputIndex), topTerminal, relation })
      }
      continue
    }

    if (relation === '>') {
      const boundary = findHandleBoundary(stack, precedenceTable)
      if (!boundary.ok) {
        return {
          accepted: false,
          steps,
          finalStack: stackToDisplay(stack),
          remainingInput: input.slice(inputIndex),
          reason: boundary.reason,
        }
      }

      const handle = extractHandle(stack, boundary)
      const match = matchHandleToProductions(handle, grammar.rules)

      if (!match.ok) {
        return {
          accepted: false,
          steps,
          finalStack: stackToDisplay(stack),
          remainingInput: input.slice(inputIndex),
          reason: match.ambiguous
            ? `Ambiguous reduction for handle "${formatSymbols(stackToDisplay(handle))}". Candidates: ${match.candidates
                .map(formatMatchedProduction)
                .join(', ')}.`
            : `No production right-hand side matches handle "${formatSymbols(stackToDisplay(handle))}".`,
        }
      }

      stack.splice(boundary.handleStartIndex, handle.length, {
        type: 'nonterminal',
        symbol: match.production.lhs,
      })
      const explanation = `"${topTerminal.symbol}" > "${nextInput}", so the parser locates the nearest "<" boundary. Handle "${formatSymbols(
        stackToDisplay(handle),
      )}" matches ${formatMatchedProduction(match.production)}, so it is reduced to ${match.production.lhs}.`
      steps.push(
        makeStep({
          stepNumber,
          stackBefore,
          remainingInputBefore,
          topTerminal: topTerminal.symbol,
          nextInput,
          relation,
          action: 'REDUCE',
          handle,
          handleStartIndex: boundary.handleStartIndex,
          production: match.production,
          stackAfter: stack,
          remainingInputAfter: input.slice(inputIndex),
          explanation,
        }),
      )

      if (debug) {
        console.debug({ stack: stackToDisplay(stack), input: input.slice(inputIndex), handle, match })
      }
      continue
    }

    if (topTerminal.symbol === '$' && nextInput === '$') {
      return {
        accepted: false,
        steps,
        finalStack: stackToDisplay(stack),
        remainingInput: input.slice(inputIndex),
        reason: `Input ended, but stack does not reduce to the start symbol "${startSymbol}".`,
      }
    }
  }

  return {
    accepted: false,
    steps,
    finalStack: stackToDisplay(stack),
    remainingInput: input.slice(inputIndex),
    reason: `Maximum parser step limit reached (${maxSteps}).`,
  }
}

export function prepareAndParse({ grammar, inputText, precedenceTable, startSymbol, conflicts = [] }) {
  const terminals = extractSymbols(grammar).terminals
  const preconditionErrors = validateParserPreconditions({ grammar, precedenceTable, conflicts, inputText })
  if (preconditionErrors.length) {
    return {
      accepted: false,
      steps: [],
      tokens: [],
      reason: preconditionErrors.join(' '),
    }
  }

  const tokenized = tokenizeInput(inputText, terminals)
  if (!tokenized.ok) {
    return {
      accepted: false,
      steps: [],
      tokens: tokenized.tokens,
      reason: tokenized.errors.map((error) => error.reason).join(' '),
      tokenizationErrors: tokenized.errors,
    }
  }

  const result = parseOperatorPrecedence({
    grammar,
    inputTokens: tokenized.tokens,
    precedenceTable,
    startSymbol,
  })

  return {
    ...result,
    tokens: tokenized.tokens,
  }
}
