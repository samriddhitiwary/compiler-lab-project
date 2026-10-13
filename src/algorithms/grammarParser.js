import { EPSILON_SYMBOLS, isNonTerminal } from './symbolUtils.js'

function normalizeArrow(line) {
  return line.replace(/→|=>|::=/g, '->')
}

function splitAlternatives(rhs) {
  const alternatives = []
  let current = ''
  let quote = null

  for (let index = 0; index < rhs.length; index += 1) {
    const char = rhs[index]

    if ((char === "'" || char === '"') && rhs[index - 1] !== '\\') {
      quote = quote === char ? null : quote || char
      current += char
      continue
    }

    if (char === '|' && !quote) {
      alternatives.push(current)
      current = ''
      continue
    }

    current += char
  }

  alternatives.push(current)
  return alternatives
}

function matchLongestKnownNonTerminal(text, index, knownNonTerminals) {
  return knownNonTerminals.find((symbol) => text.startsWith(symbol, index))
}

export function tokenizeRhs(rawAlternative, knownNonTerminals = []) {
  const text = rawAlternative.trim()
  if (!text) {
    return []
  }

  const compactText = text.replace(/\s+/g, '')
  if (EPSILON_SYMBOLS.has(compactText)) {
    return [compactText]
  }

  const symbols = []
  let index = 0
  const sortedNonTerminals = [...knownNonTerminals].sort((a, b) => b.length - a.length)
  const multiCharOperators = ['==', '<=', '>=', '!=', '&&', '||', '++', '--']

  while (index < text.length) {
    const char = text[index]

    if (/\s/.test(char)) {
      index += 1
      continue
    }

    if (char === "'" || char === '"') {
      const quote = char
      let end = index + 1
      let value = ''

      while (end < text.length && text[end] !== quote) {
        value += text[end]
        end += 1
      }

      symbols.push(value)
      index = end < text.length ? end + 1 : end
      continue
    }

    const knownNonTerminal = matchLongestKnownNonTerminal(text, index, sortedNonTerminals)
    if (knownNonTerminal) {
      symbols.push(knownNonTerminal)
      index += knownNonTerminal.length
      continue
    }

    const operator = multiCharOperators.find((candidate) => text.startsWith(candidate, index))
    if (operator) {
      symbols.push(operator)
      index += operator.length
      continue
    }

    if (/[A-Z]/.test(char)) {
      let end = index + 1
      while (end < text.length && /[0-9']/.test(text[end])) {
        end += 1
      }
      symbols.push(text.slice(index, end))
      index = end
      continue
    }

    if (/[a-z_]/.test(char)) {
      let end = index + 1
      while (end < text.length && /[a-z0-9_]/.test(text[end])) {
        end += 1
      }
      symbols.push(text.slice(index, end))
      index = end
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
  const rawLines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (rawLines.length === 0) {
    errors.push('Grammar input is empty.')
  }

  const preparedLines = rawLines.map((rawLine, lineIndex) => {
    const line = normalizeArrow(rawLine)
    const arrowMatches = line.match(/->/g) || []
    if (arrowMatches.length !== 1) {
      return { arrowMatches, lhs: '', rhs: '', lineIndex }
    }

    const [lhs, rhs] = line.split('->').map((part) => part.trim())
    return { arrowMatches, lhs, rhs, lineIndex }
  })

  const knownNonTerminals = preparedLines
    .map((line) => line.lhs)
    .filter((lhs) => lhs && isNonTerminal(lhs))

  preparedLines.forEach(({ arrowMatches, lhs: rawLhs, rhs: rawRhs, lineIndex }) => {
    if (arrowMatches.length === 0) {
      errors.push(`Line ${lineIndex + 1}: missing production arrow "->".`)
      return
    }

    if (arrowMatches.length > 1) {
      errors.push(`Line ${lineIndex + 1}: contains more than one production arrow.`)
      return
    }

    if (!rawLhs) {
      errors.push(`Line ${lineIndex + 1}: missing left-hand side non-terminal.`)
      return
    }

    if (!isNonTerminal(rawLhs)) {
      errors.push(`Line ${lineIndex + 1}: "${rawLhs}" is not a valid non-terminal name. Use names that start with an uppercase letter.`)
      return
    }

    if (!rawRhs) {
      errors.push(`Line ${lineIndex + 1}: missing right-hand side alternatives.`)
      return
    }

    const alternatives = splitAlternatives(rawRhs)
    if (alternatives.some((alternative) => alternative.trim() === '')) {
      errors.push(`Line ${lineIndex + 1}: empty alternative found near "|".`)
      return
    }

    productions[rawLhs] ??= []
    alternatives.forEach((alternative) => {
      const rhs = tokenizeRhs(alternative, knownNonTerminals)
      productions[rawLhs].push(rhs)
      rules.push({
        id: `${rawLhs}-${rules.length}`,
        lhs: rawLhs,
        rhs,
        production: `${rawLhs} -> ${rhs.join(' ')}`,
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
