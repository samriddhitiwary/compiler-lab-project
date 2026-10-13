import { formatProduction, isNonTerminal, isTerminal } from './symbolUtils.js'

function stackSymbolMatchesRhsSymbol(stackSymbol, rhsSymbol, exact) {
  if (isTerminal(rhsSymbol)) {
    return stackSymbol.type === 'terminal' && stackSymbol.symbol === rhsSymbol
  }

  if (exact) {
    return stackSymbol.type === 'nonterminal' && stackSymbol.symbol === rhsSymbol
  }

  return stackSymbol.type === 'nonterminal'
}

function rhsMatchesHandle(handle, rhs, exact) {
  return (
    handle.length === rhs.length &&
    rhs.every((rhsSymbol, index) => stackSymbolMatchesRhsSymbol(handle[index], rhsSymbol, exact))
  )
}

function relationCount(rule) {
  return rule.rhs.filter((symbol) => isNonTerminal(symbol)).length
}

export function matchHandleToProductions(handle, productions) {
  const nonUnitProductions = productions.filter((rule) => !(rule.rhs.length === 1 && isNonTerminal(rule.rhs[0])))
  const exact = nonUnitProductions.filter((rule) => rhsMatchesHandle(handle, rule.rhs, true))
  if (exact.length > 0) {
    return {
      ok: exact.length === 1,
      production: exact[0],
      candidates: exact,
      ambiguous: exact.length > 1,
      mode: 'exact',
    }
  }

  const shape = nonUnitProductions
    .filter((rule) => rhsMatchesHandle(handle, rule.rhs, false))
    .sort((a, b) => relationCount(b) - relationCount(a))

  if (shape.length === 0) {
    return {
      ok: false,
      production: null,
      candidates: [],
      ambiguous: false,
      mode: 'none',
    }
  }

  const bestRelationCount = relationCount(shape[0])
  const best = shape.filter((rule) => relationCount(rule) === bestRelationCount)

  return {
    ok: best.length === 1,
    production: best[0],
    candidates: best,
    ambiguous: best.length > 1,
    mode: 'operator-shape',
  }
}

export function formatMatchedProduction(production) {
  return production ? formatProduction(production.lhs, production.rhs) : ''
}
