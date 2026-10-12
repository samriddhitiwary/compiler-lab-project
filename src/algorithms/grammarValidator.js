import { EPSILON_SYMBOLS, isNonTerminal } from './symbolUtils.js'

export function validateOperatorGrammar(grammar) {
  const errors = []
  const notes = []
  const definedNonTerminals = new Set(grammar.nonTerminals)

  if (!grammar.startSymbol || !definedNonTerminals.has(grammar.startSymbol)) {
    errors.push({
      type: 'START_SYMBOL',
      reason: 'The start symbol must be one of the grammar non-terminals.',
    })
  }

  grammar.rules.forEach((rule) => {
    if (rule.rhs.length === 0) {
      errors.push({
        type: 'EMPTY_RHS',
        production: rule.production,
        reason: 'The production has an empty right-hand side.',
      })
    }

    if (rule.rhs.length === 1 && EPSILON_SYMBOLS.has(rule.rhs[0])) {
      errors.push({
        type: 'EPSILON',
        production: rule.production,
        reason: 'Operator grammars cannot contain epsilon productions.',
      })
    }

    rule.rhs.forEach((symbol) => {
      if (isNonTerminal(symbol) && !definedNonTerminals.has(symbol)) {
        errors.push({
          type: 'UNDEFINED_NON_TERMINAL',
          production: rule.production,
          reason: `Non-terminal ${symbol} is used but has no production rule.`,
        })
      }
    })

    for (let index = 0; index < rule.rhs.length - 1; index += 1) {
      const current = rule.rhs[index]
      const next = rule.rhs[index + 1]
      if (isNonTerminal(current) && isNonTerminal(next)) {
        errors.push({
          type: 'ADJACENT_NON_TERMINALS',
          production: rule.production,
          reason: `Two adjacent non-terminals ${current} and ${next} occur consecutively.`,
        })
      }
    }
  })

  if (errors.length === 0) {
    notes.push('No epsilon productions found.')
    notes.push('No adjacent non-terminals found.')
    notes.push('All referenced non-terminals are defined.')
  }

  return {
    ok: errors.length === 0,
    errors,
    notes,
  }
}
