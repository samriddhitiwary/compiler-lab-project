import { isTerminal } from './symbolUtils.js'

export function toStackSymbol(symbol) {
  return isTerminal(symbol) || symbol === '$'
    ? { type: 'terminal', symbol }
    : { type: 'nonterminal', symbol }
}

export function stackToDisplay(stack) {
  return stack.map((item) => item.symbol)
}

export function findTopmostTerminal(stack) {
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    if (stack[index].type === 'terminal') {
      return { symbol: stack[index].symbol, index }
    }
  }

  return null
}

export function getPrecedenceRelation(table, left, right) {
  const relations = table[left]?.[right]?.relations || []
  if (relations.length !== 1) {
    return {
      relation: null,
      relations,
      conflict: relations.length > 1,
    }
  }

  return {
    relation: relations[0],
    relations,
    conflict: false,
  }
}

export function findHandleBoundary(stack, precedenceTable) {
  const terminalIndexes = stack
    .map((item, index) => ({ ...item, index }))
    .filter((item) => item.type === 'terminal')

  if (terminalIndexes.length < 2) {
    return {
      ok: false,
      reason: 'No left terminal boundary exists for reduction.',
    }
  }

  for (let index = terminalIndexes.length - 1; index > 0; index -= 1) {
    const rightTerminal = terminalIndexes[index]
    const leftTerminal = terminalIndexes[index - 1]
    const relation = getPrecedenceRelation(precedenceTable, leftTerminal.symbol, rightTerminal.symbol).relation

    if (relation === '<') {
      return {
        ok: true,
        boundaryIndex: leftTerminal.index,
        handleStartIndex: leftTerminal.index + 1,
        handleEndIndex: stack.length - 1,
      }
    }

    if (relation === '=' || relation === '>') {
      continue
    }

    return {
      ok: false,
      reason: `No precedence relation exists between "${leftTerminal.symbol}" and "${rightTerminal.symbol}" while locating the handle boundary.`,
    }
  }

  return {
    ok: false,
    reason: 'Could not find a "<" precedence boundary for the handle.',
  }
}

export function extractHandle(stack, boundary) {
  return stack.slice(boundary.handleStartIndex, boundary.handleEndIndex + 1)
}
