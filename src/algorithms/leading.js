import { cloneSetsAsArrays, formatProduction, isNonTerminal, isTerminal, makeEmptySets } from './symbolUtils.js'

export function computeLeading(grammar) {
  const sets = makeEmptySets(grammar.nonTerminals)
  const steps = []

  const addStep = ({ nonTerminal, symbol, rule, production, explanation }) => {
    if (!sets[nonTerminal].has(symbol)) {
      sets[nonTerminal].add(symbol)
      steps.push({
        type: 'LEADING',
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
      const first = rhs[0]
      const second = rhs[1]

      // Rule: If A -> a alpha and a is terminal, then a belongs to LEADING(A).
      if (first && isTerminal(first)) {
        changed =
          addStep({
            nonTerminal: lhs,
            symbol: first,
            production,
            rule: 'A -> a alpha',
            explanation: `Since ${production} begins with terminal "${first}", "${first}" is added to LEADING(${lhs}).`,
          }) || changed
      }

      // Rule: If A -> B a alpha, add the terminal after the leading non-terminal.
      if (first && second && isNonTerminal(first) && isTerminal(second)) {
        changed =
          addStep({
            nonTerminal: lhs,
            symbol: second,
            production,
            rule: 'A -> B a alpha',
            explanation: `In ${production}, terminal "${second}" immediately follows the leading non-terminal ${first}, so it is added to LEADING(${lhs}).`,
          }) || changed
      }

      // Rule: If A -> B alpha, every terminal in LEADING(B) propagates to LEADING(A).
      if (first && isNonTerminal(first)) {
        sets[first]?.forEach((symbol) => {
          changed =
            addStep({
              nonTerminal: lhs,
              symbol,
              production,
              rule: 'A -> B alpha',
              explanation: `Because ${production} starts with non-terminal ${first}, every symbol already in LEADING(${first}) also belongs to LEADING(${lhs}).`,
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
