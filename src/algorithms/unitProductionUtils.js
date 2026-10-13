import { isNonTerminal } from './symbolUtils.js'

export function buildUnitProductionClosure(grammar) {
  const derives = Object.fromEntries(grammar.nonTerminals.map((symbol) => [symbol, new Set([symbol])]))

  let changed = true
  while (changed) {
    changed = false

    grammar.rules.forEach((rule) => {
      if (rule.rhs.length !== 1 || !isNonTerminal(rule.rhs[0])) {
        return
      }

      const target = rule.rhs[0]
      derives[target]?.forEach((reachable) => {
        if (!derives[rule.lhs].has(reachable)) {
          derives[rule.lhs].add(reachable)
          changed = true
        }
      })
    })
  }

  const canReduceTo = Object.fromEntries(grammar.nonTerminals.map((symbol) => [symbol, new Set([symbol])]))
  Object.entries(derives).forEach(([ancestor, descendants]) => {
    descendants.forEach((descendant) => {
      canReduceTo[descendant]?.add(ancestor)
    })
  })

  return {
    derives: Object.fromEntries(Object.entries(derives).map(([key, value]) => [key, [...value]])),
    canReduceTo: Object.fromEntries(Object.entries(canReduceTo).map(([key, value]) => [key, [...value]])),
  }
}

export function canRepresentStart(symbol, startSymbol, closure) {
  return Boolean(closure.canReduceTo[symbol]?.includes(startSymbol))
}
