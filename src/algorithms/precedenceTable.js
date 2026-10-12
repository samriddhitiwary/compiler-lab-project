import { extractSymbols, formatProduction, isNonTerminal, isTerminal, uniqueSorted } from './symbolUtils.js'

function relationStep(left, relation, right, production, rule, explanation) {
  return {
    left,
    relation,
    right,
    production,
    rule,
    explanation,
  }
}

export function generatePrecedenceSteps(grammar, leading, trailing, startSymbol) {
  const steps = []

  grammar.rules.forEach(({ lhs, rhs }) => {
    const production = formatProduction(lhs, rhs)

    for (let index = 0; index < rhs.length - 1; index += 1) {
      const current = rhs[index]
      const next = rhs[index + 1]

      if (isTerminal(current) && isTerminal(next)) {
        steps.push(
          relationStep(
            current,
            '=',
            next,
            production,
            'Adjacent terminals',
            `Terminals "${current}" and "${next}" are adjacent in ${production}, therefore ${current} = ${next}.`,
          ),
        )
      }

      if (isTerminal(current) && isNonTerminal(next)) {
        ;(leading[next] || []).forEach((symbol) => {
          steps.push(
            relationStep(
              current,
              '<',
              symbol,
              production,
              'Terminal followed by non-terminal',
              `"${current}" is followed by non-terminal ${next}, and "${symbol}" belongs to LEADING(${next}), therefore ${current} < ${symbol}.`,
            ),
          )
        })
      }

      if (isNonTerminal(current) && isTerminal(next)) {
        ;(trailing[current] || []).forEach((symbol) => {
          steps.push(
            relationStep(
              symbol,
              '>',
              next,
              production,
              'Non-terminal followed by terminal',
              `${current} is followed by terminal "${next}", and "${symbol}" belongs to TRAILING(${current}), therefore ${symbol} > ${next}.`,
            ),
          )
        })
      }
    }

    for (let index = 0; index < rhs.length - 2; index += 1) {
      const first = rhs[index]
      const middle = rhs[index + 1]
      const last = rhs[index + 2]

      if (isTerminal(first) && isNonTerminal(middle) && isTerminal(last)) {
        steps.push(
          relationStep(
            first,
            '=',
            last,
            production,
            'Terminal, non-terminal, terminal',
            `In ${production}, terminal "${first}" surrounds non-terminal ${middle} with terminal "${last}", therefore ${first} = ${last}.`,
          ),
        )
      }
    }
  })

  ;(leading[startSymbol] || []).forEach((symbol) => {
    steps.push(
      relationStep(
        '$',
        '<',
        symbol,
        'End marker',
        'Start-symbol LEADING end-marker rule',
        `"${symbol}" belongs to LEADING(${startSymbol}), therefore $ < ${symbol}.`,
      ),
    )
  })

  ;(trailing[startSymbol] || []).forEach((symbol) => {
    steps.push(
      relationStep(
        symbol,
        '>',
        '$',
        'End marker',
        'Start-symbol TRAILING end-marker rule',
        `"${symbol}" belongs to TRAILING(${startSymbol}), therefore ${symbol} > $.`,
      ),
    )
  })

  steps.push(relationStep('$', '=', '$', 'End marker', 'End-marker identity', 'The parser boundary marker is related to itself as $ = $.'))

  return steps
}

export function buildPrecedenceTable(grammar, steps, stepLimit = steps.length) {
  const { terminals } = extractSymbols(grammar)
  const symbols = uniqueSorted([...terminals, '$'])
  const table = Object.fromEntries(
    symbols.map((row) => [row, Object.fromEntries(symbols.map((column) => [column, { relations: [], sources: [], conflict: false }]))]),
  )
  const conflicts = []

  steps.slice(0, stepLimit).forEach((step, stepIndex) => {
    const cell = table[step.left]?.[step.right]
    if (!cell) {
      return
    }

    const existingRelations = new Set(cell.relations)
    if (!existingRelations.has(step.relation)) {
      if (cell.relations.length > 0) {
        cell.conflict = true
        conflicts.push({
          pair: [step.left, step.right],
          existingRelations: [...cell.relations],
          newRelation: step.relation,
          existingSources: [...cell.sources],
          newSource: step,
          stepIndex,
        })
      }
      cell.relations.push(step.relation)
    }

    cell.sources.push({ ...step, stepIndex })
  })

  return {
    symbols,
    table,
    conflicts,
  }
}
