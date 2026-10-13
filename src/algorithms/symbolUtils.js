export const EPSILON_SYMBOLS = new Set(['ε', 'epsilon', 'eps', 'Epsilon', 'EPSILON', 'EPS'])

export function isNonTerminal(symbol) {
  return /^[A-Z][A-Za-z0-9']*$/.test(symbol)
}

export function isTerminal(symbol) {
  return symbol !== '$' && !isNonTerminal(symbol)
}

export function formatProduction(lhs, rhsSymbols) {
  return `${lhs} -> ${rhsSymbols.join(' ')}`
}

export function formatSymbols(symbols) {
  return symbols.join(' ')
}

export function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

export function extractSymbols(grammar) {
  const nonTerminals = Object.keys(grammar.productions)
  const terminalSet = new Set()

  grammar.rules.forEach((rule) => {
    rule.rhs.forEach((symbol) => {
      if (isTerminal(symbol)) {
        terminalSet.add(symbol)
      }
    })
  })

  return {
    nonTerminals,
    terminals: uniqueSorted(terminalSet),
  }
}

export function makeEmptySets(nonTerminals) {
  return Object.fromEntries(nonTerminals.map((nonTerminal) => [nonTerminal, new Set()]))
}

export function cloneSetsAsArrays(sets) {
  return Object.fromEntries(
    Object.entries(sets).map(([nonTerminal, values]) => [nonTerminal, uniqueSorted([...values])]),
  )
}
