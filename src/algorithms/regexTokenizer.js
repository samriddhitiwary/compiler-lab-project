export const EPSILON = 'ε'
export const REGEX_OPERATORS = new Set(['|', '.', '*', '(', ')'])
export const MAX_REGEX_LENGTH = 120

export function isRegexOperatorToken(token) {
  return REGEX_OPERATORS.has(token.value)
}

export function isRegexSymbolToken(token) {
  return token.type === 'SYMBOL' || token.type === 'EPSILON'
}

export function tokenizeRegex(input) {
  const errors = []
  const tokens = []
  const text = input.trim()

  if (!text) {
    return { ok: false, tokens, errors: [{ position: 0, token: '', reason: 'Regular Expression is empty.' }] }
  }

  if (text.length > MAX_REGEX_LENGTH) {
    return {
      ok: false,
      tokens,
      errors: [{ position: MAX_REGEX_LENGTH, token: '', reason: `Regular Expression is too long. Maximum length is ${MAX_REGEX_LENGTH}.` }],
    }
  }

  let index = 0
  while (index < text.length) {
    const char = text[index]

    if (/\s/.test(char)) {
      index += 1
      continue
    }

    if (char === '#') {
      errors.push({ position: index, token: '#', reason: '"#" is reserved for DFA construction and cannot be entered.' })
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
      if (end >= text.length) {
        errors.push({ position: index, token: quote, reason: 'Quoted alphabet symbol is missing its closing quote.' })
        break
      }
      if (!value) {
        errors.push({ position: index, token: quote + quote, reason: 'Quoted alphabet symbol cannot be empty.' })
      } else if (value === '#') {
        errors.push({ position: index, token: value, reason: '"#" is reserved for DFA construction and cannot be entered.' })
      } else {
        tokens.push({ type: value === EPSILON ? 'EPSILON' : 'SYMBOL', value: value === 'epsilon' || value === 'eps' ? EPSILON : value, position: index })
      }
      index = end + 1
      continue
    }

    if (text.startsWith('epsilon', index)) {
      tokens.push({ type: 'EPSILON', value: EPSILON, position: index })
      index += 'epsilon'.length
      continue
    }

    if (text.startsWith('eps', index)) {
      tokens.push({ type: 'EPSILON', value: EPSILON, position: index })
      index += 'eps'.length
      continue
    }

    if (char === EPSILON) {
      tokens.push({ type: 'EPSILON', value: EPSILON, position: index })
      index += 1
      continue
    }

    if (REGEX_OPERATORS.has(char)) {
      tokens.push({ type: 'OPERATOR', value: char, position: index })
      index += 1
      continue
    }

    if (/^[A-Za-z0-9_]$/.test(char)) {
      tokens.push({ type: 'SYMBOL', value: char, position: index })
      index += 1
      continue
    }

    errors.push({ position: index, token: char, reason: `"${char}" is not a supported regular-expression symbol or operator.` })
    index += 1
  }

  return { ok: errors.length === 0, tokens, errors }
}

export function tokenLabel(token) {
  return token?.value ?? ''
}
