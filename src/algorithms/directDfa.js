function keyOf(positions) {
  return [...positions].sort((a, b) => a - b).join(',')
}

function setFrom(values) {
  return new Set(values)
}

export function constructDirectDfa({ root, followpos, positionToSymbol, hashPosition, maxStates = 80 }) {
  const alphabet = [...new Set(Object.values(positionToSymbol).filter((symbol) => symbol !== '#' && symbol !== 'ε'))].sort()
  const states = []
  const stateMap = new Map()
  const transitions = {}
  const steps = []

  function getOrCreateState(positions) {
    const key = keyOf(positions)
    if (stateMap.has(key)) {
      return { state: states[stateMap.get(key)], created: false }
    }
    if (states.length >= maxStates) {
      throw new Error(`DFA state limit exceeded (${maxStates}).`)
    }
    const state = {
      name: `D${states.length}`,
      key,
      positions: [...positions].sort((a, b) => a - b),
      isStart: states.length === 0,
      isFinal: positions.has(hashPosition),
      marked: false,
    }
    stateMap.set(key, states.length)
    states.push(state)
    transitions[state.name] = {}
    return { state, created: true }
  }

  getOrCreateState(setFrom(root.firstpos))

  for (let index = 0; index < states.length; index += 1) {
    const state = states[index]
    state.marked = true

    alphabet.forEach((symbol) => {
      const matchingPositions = state.positions.filter((position) => positionToSymbol[position] === symbol)
      const targetPositions = new Set()
      matchingPositions.forEach((position) => {
        ;(followpos[position] || []).forEach((target) => targetPositions.add(target))
      })

      if (targetPositions.size === 0) {
        steps.push({
          currentState: state.name,
          statePositions: state.positions,
          symbol,
          matchingPositions,
          followposUsed: {},
          union: [],
          result: 'No transition',
          explanation: `No positions in ${state.name} with symbol "${symbol}" produce a non-empty followpos union.`,
        })
        return
      }

      const { state: targetState, created } = getOrCreateState(targetPositions)
      transitions[state.name][symbol] = targetState.name
      steps.push({
        currentState: state.name,
        statePositions: state.positions,
        symbol,
        matchingPositions,
        followposUsed: Object.fromEntries(matchingPositions.map((position) => [position, followpos[position] || []])),
        union: [...targetPositions].sort((a, b) => a - b),
        result: `${state.name} --${symbol}--> ${targetState.name}`,
        created,
        targetState: targetState.name,
        explanation: `${state.name} on "${symbol}" uses positions ${matchingPositions.join(', ') || '∅'} and reaches ${targetState.name}.`,
      })
    })
  }

  return {
    alphabet,
    states,
    transitions,
    startState: 'D0',
    finalStates: states.filter((state) => state.isFinal).map((state) => state.name),
    steps,
  }
}
