export function simulateDfa(dfa, input) {
  const text = input.trim()
  const symbols = []
  const alphabet = [...dfa.alphabet].sort((a, b) => b.length - a.length)
  let cursor = 0

  while (cursor < text.length) {
    if (/\s/.test(text[cursor])) {
      cursor += 1
      continue
    }
    const symbol = alphabet.find((candidate) => text.startsWith(candidate, cursor))
    if (!symbol) {
      return {
        accepted: false,
        trace: [],
        reason: `"${text[cursor]}" is not part of the DFA alphabet.`,
      }
    }
    symbols.push(symbol)
    cursor += symbol.length
  }

  const trace = []
  let currentState = dfa.startState

  for (let index = 0; index < symbols.length; index += 1) {
    const symbol = symbols[index]
    if (!dfa.alphabet.includes(symbol)) {
      return {
        accepted: false,
        trace,
        reason: `"${symbol}" is not part of the DFA alphabet.`,
      }
    }
    const nextState = dfa.transitions[currentState]?.[symbol]
    trace.push({ step: index, currentState, symbol, nextState: nextState || 'REJECT' })
    if (!nextState) {
      return {
        accepted: false,
        trace,
        reason: `No transition exists from ${currentState} on "${symbol}".`,
      }
    }
    currentState = nextState
  }

  const accepted = dfa.finalStates.includes(currentState)
  return {
    accepted,
    trace,
    finalState: currentState,
    reason: accepted ? 'Input accepted by the generated DFA.' : `${currentState} is not an accepting state.`,
  }
}
