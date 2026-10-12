import { cloneSetsAsArrays, formatProduction, isNonTerminal, isTerminal, makeEmptySets } from './symbolUtils.js'

export function computeTrailing(grammar) {
  const sets = makeEmptySets(grammar.nonTerminals)
  const steps = []

  const addStep = ({ nonTerminal, symbol, rule, production, explanation }) => {
    if (!sets[nonTerminal].has(symbol)) {
      sets[nonTerminal].add(symbol)
      steps.push({
        type: 'TRAILING',
        nonTerminal,
        symbol,
        production,
        rule,
        explanation,
        snapshot: cloneSetsAsArrays(sets),
      })
      return true
    }
    return false
  }

  let changed = true
  while (changed) {
    changed = false

    grammar.rules.forEach(({ lhs, rhs }) => {
      const production = formatProduction(lhs, rhs)
      const last = rhs.at(-1)
      const beforeLast = rhs.at(-2)

      // Rule: If A -> alpha a and a is terminal, then a belongs to TRAILING(A).
      if (last && isTerminal(last)) {
        changed =
          addStep({
            nonTerminal: lhs,
            symbol: last,
            production,
            rule: 'A -> alpha a',
            explanation: `Since ${production} ends with terminal "${last}", "${last}" is added to TRAILING(${lhs}).`,
          }) || changed
      }

      // Rule: If A -> alpha a B, add the terminal before the ending non-terminal.
      if (beforeLast && last && isTerminal(beforeLast) && isNonTerminal(last)) {
        changed =
          addStep({
            nonTerminal: lhs,
            symbol: beforeLast,
            production,
            rule: 'A -> alpha a B',
            explanation: `In ${production}, terminal "${beforeLast}" immediately precedes ending non-terminal ${last}, so it is added to TRAILING(${lhs}).`,
          }) || changed
      }

      // Rule: If A -> alpha B, every terminal in TRAILING(B) propagates to TRAILING(A).
      if (last && isNonTerminal(last)) {
        sets[last]?.forEach((symbol) => {
          changed =
            addStep({
              nonTerminal: lhs,
              symbol,
              production,
              rule: 'A -> alpha B',
              explanation: `Because ${production} ends with non-terminal ${last}, every symbol already in TRAILING(${last}) also belongs to TRAILING(${lhs}).`,
            }) || changed
        })
      }
    })
  }

  return {
    sets: cloneSetsAsArrays(sets),
    steps,
  }
}
