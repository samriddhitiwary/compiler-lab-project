import { describe, expect, test } from 'vitest'
import { parseGrammar } from '../grammarParser.js'
import { validateOperatorGrammar } from '../grammarValidator.js'
import { computeLeading } from '../leading.js'
import { computeTrailing } from '../trailing.js'
import { buildPrecedenceTable, generatePrecedenceSteps } from '../precedenceTable.js'
import { tokenizeInput } from '../inputTokenizer.js'
import { findHandleBoundary, findTopmostTerminal, toStackSymbol } from '../handleFinder.js'
import { matchHandleToProductions } from '../productionMatcher.js'
import { parseOperatorPrecedence, prepareAndParse } from '../operatorPrecedenceParser.js'
import { sampleGrammars } from '../../data/sampleGrammars.js'

function prepare(grammarText) {
  const parsed = parseGrammar(grammarText)
  expect(parsed.ok).toBe(true)
  const validation = validateOperatorGrammar(parsed.grammar)
  expect(validation.ok).toBe(true)
  const leading = computeLeading(parsed.grammar)
  const trailing = computeTrailing(parsed.grammar)
  const steps = generatePrecedenceSteps(parsed.grammar, leading.sets, trailing.sets, parsed.grammar.startSymbol)
  const table = buildPrecedenceTable(parsed.grammar, steps)
  return { grammar: parsed.grammar, table }
}

function parseInput(grammarText, inputText) {
  const { grammar, table } = prepare(grammarText)
  return prepareAndParse({
    grammar,
    inputText,
    precedenceTable: table.table,
    startSymbol: grammar.startSymbol,
    conflicts: table.conflicts,
  })
}

describe('Review 2 tokenizer and parser helpers', () => {
  test('tokenizes input by longest terminal match', () => {
    expect(tokenizeInput('id+id*id', ['id', '+', '*']).tokens).toEqual(['id', '+', 'id', '*', 'id'])
    expect(tokenizeInput('i&i', ['i', '+']).ok).toBe(false)
  })

  test('discovers the topmost terminal under non-terminals', () => {
    const stack = ['$', 'E', '+', 'T'].map(toStackSymbol)
    expect(findTopmostTerminal(stack)).toMatchObject({ symbol: '+', index: 2 })
  })

  test('finds handle boundary using nearest < relation', () => {
    const { table } = prepare(sampleGrammars.validExpression)
    const stack = ['$', 'F', '+', 'F', '*', 'F'].map(toStackSymbol)
    const boundary = findHandleBoundary(stack, table.table)
    expect(boundary.ok).toBe(true)
    expect(stack.slice(boundary.handleStartIndex).map((item) => item.symbol)).toEqual(['F', '*', 'F'])
  })

  test('matches exact and operator-shape handles to productions', () => {
    const { grammar } = prepare(sampleGrammars.validExpression)
    const exact = matchHandleToProductions(['i'].map(toStackSymbol), grammar.rules)
    expect(exact.ok).toBe(true)
    expect(exact.production.lhs).toBe('F')

    const shape = matchHandleToProductions(['F', '*', 'F'].map(toStackSymbol), grammar.rules)
    expect(shape.ok).toBe(true)
    expect(shape.production.lhs).toBe('T')
  })
})

describe('Review 2 parser behavior', () => {
  test('accepts valid arithmetic expressions', () => {
    ;['i', 'i+i', 'i*i', 'i+i*i', '(i+i)*i', 'i*(i+i)', '(i)'].forEach((input) => {
      expect(parseInput(sampleGrammars.validExpression, input).accepted, input).toBe(true)
    })
  })

  test('rejects invalid arithmetic expressions', () => {
    ;['+i', 'i+', 'i**i', 'i++i', '(i+i', 'i+i)', 'ii', '()'].forEach((input) => {
      expect(parseInput(sampleGrammars.validExpression, input).accepted, input).toBe(false)
    })
  })

  test('records both shift and reduce steps', () => {
    const result = parseInput(sampleGrammars.validExpression, 'i+i')
    expect(result.accepted).toBe(true)
    expect(result.steps.some((step) => step.action === 'SHIFT')).toBe(true)
    expect(result.steps.some((step) => step.action === 'REDUCE')).toBe(true)
  })

  test('accepts and rejects a non-arithmetic grammar generically', () => {
    expect(parseInput(sampleGrammars.genericValid, 'aa').accepted).toBe(true)
    expect(parseInput(sampleGrammars.genericValid, 'b').accepted).toBe(true)
    expect(parseInput(sampleGrammars.genericValid, 'ab').accepted).toBe(false)
  })

  test('supports multi-character non-terminals and terminals', () => {
    const parsed = parseGrammar(sampleGrammars.multiCharacter)
    expect(parsed.grammar.rules[0].rhs).toEqual(['Expr', '+', 'Term'])
    const result = parseInput(sampleGrammars.multiCharacter, 'id + id * id')
    expect(result.tokens).toEqual(['id', '+', 'id', '*', 'id'])
    expect(result.accepted).toBe(true)
  })

  test('rejects unknown input terminals before parsing', () => {
    const result = parseInput(sampleGrammars.validExpression, 'i&i')
    expect(result.accepted).toBe(false)
    expect(result.reason).toContain('not a terminal')
  })

  test('rejects missing precedence relations', () => {
    const result = parseInput(sampleGrammars.validExpression, 'ii')
    expect(result.accepted).toBe(false)
    expect(result.reason).toContain('No precedence relation')
  })

  test('prevents parsing when precedence conflicts exist', () => {
    const { grammar, table } = prepare(sampleGrammars.conflict)
    expect(table.conflicts.length).toBeGreaterThan(0)
    const result = prepareAndParse({
      grammar,
      inputText: 'aa',
      precedenceTable: table.table,
      startSymbol: grammar.startSymbol,
      conflicts: table.conflicts,
    })
    expect(result.accepted).toBe(false)
    expect(result.reason).toContain('conflicting relations')
  })

  test('invalid operator grammars fail before parser setup', () => {
    const parsed = parseGrammar(sampleGrammars.invalidAdjacent)
    expect(validateOperatorGrammar(parsed.grammar).ok).toBe(false)
    const epsilonParsed = parseGrammar(sampleGrammars.invalidEpsilon)
    expect(validateOperatorGrammar(epsilonParsed.grammar).ok).toBe(false)
  })

  test('unit productions are handled by final acceptance closure', () => {
    const result = parseInput(sampleGrammars.validExpression, 'i')
    expect(result.accepted).toBe(true)
    expect(result.finalStack).toEqual(['$', 'F'])
  })

  test('infinite-loop protection aborts repeated states', () => {
    const { grammar, table } = prepare(sampleGrammars.validExpression)
    const result = parseOperatorPrecedence({
      grammar,
      inputTokens: ['i'],
      precedenceTable: {
        ...table.table,
        i: {
          ...table.table.i,
          $: { relations: ['>'], sources: [], conflict: false },
        },
      },
      startSymbol: grammar.startSymbol,
    })
    expect(result.accepted).toBe(true)
  })
})
