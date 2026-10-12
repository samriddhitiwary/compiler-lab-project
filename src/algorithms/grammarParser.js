import { EPSILON_SYMBOLS, isNonTerminal } from './symbolUtils.js'

function normalizeArrow(line) {
  return line.replace(/→|=>|::=/g, '->')
}

export function tokenizeRhs(rawAlternative) {
  const text = rawAlternative.replace(/\s+/g, '')
  if (!text) {
    return []
  }

  if (EPSILON_SYMBOLS.has(text)) {
    return [text]
  }

  const symbols = []
  let index = 0

  while (index < text.length) {
    const char = text[index]

    if (/[A-Z]/.test(char)) {
      let end = index + 1
      while (end < text.length && /[0-9']/.test(text[end])) {
        end += 1
      }
      symbols.push(text.slice(index, end))
      index = end
      continue
    }

    if (text.slice(index, index + 2) === 'id') {
      symbols.push('id')
      index += 2
      continue
    }

    if (/[a-z]/.test(char)) {
      symbols.push(char)
      index += 1
      continue
    }

    symbols.push(char)
    index += 1
  }

  return symbols
}

export function parseGrammar(text, preferredStartSymbol = '') {
  const errors = []
  const productions = {}
  const rules = []
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    errors.push('Grammar input is empty.')
  }

  lines.forEach((rawLine, lineIndex) => {
    const line = normalizeArrow(rawLine)
    const arrowMatches = line.match(/->/g) || []

    if (arrowMatches.length === 0) {
      errors.push(`Line ${lineIndex + 1}: missing production arrow "->".`)
      return
    }

    if (arrowMatches.length > 1) {
      errors.push(`Line ${lineIndex + 1}: contains more than one production arrow.`)
      return
    }

    const [rawLhs, rawRhs] = line.split('->').map((part) => part.trim())
    if (!rawLhs) {
      errors.push(`Line ${lineIndex + 1}: missing left-hand side non-terminal.`)
      return
    }

    if (!isNonTerminal(rawLhs)) {
      errors.push(`Line ${lineIndex + 1}: "${rawLhs}" is not a valid uppercase non-terminal.`)
      return
    }

    if (!rawRhs) {
      errors.push(`Line ${lineIndex + 1}: missing right-hand side alternatives.`)
      return
    }

    const alternatives = rawRhs.split('|')
    if (alternatives.some((alternative) => alternative.trim() === '')) {
      errors.push(`Line ${lineIndex + 1}: empty alternative found near "|".`)
      return
    }

    productions[rawLhs] ??= []
    alternatives.forEach((alternative) => {
      const rhs = tokenizeRhs(alternative)
      productions[rawLhs].push(rhs)
      rules.push({
        id: `${rawLhs}-${rules.length}`,
        lhs: rawLhs,
        rhs,
        production: `${rawLhs} -> ${rhs.join('')}`,
        sourceLine: lineIndex + 1,
      })
    })
  })

  const nonTerminals = Object.keys(productions)
  const startSymbol = preferredStartSymbol || nonTerminals[0] || ''
  if (preferredStartSymbol && !productions[preferredStartSymbol]) {
    errors.push(`Start symbol "${preferredStartSymbol}" does not appear on the left-hand side of any rule.`)
  }

  return {
    ok: errors.length === 0,
    errors,
    grammar: {
      productions,
      rules,
      nonTerminals,
      startSymbol,
    },
  }
}
