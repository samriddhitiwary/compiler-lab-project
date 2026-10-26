import { isRegexSymbolToken, tokenizeRegex } from './regexTokenizer.js'

function isOperandStart(token) {
  return token && (isRegexSymbolToken(token) || token.value === '(')
}

function isOperandEnd(token) {
  return token && (isRegexSymbolToken(token) || token.value === ')' || token.value === '*')
}

export function validateRegex(input) {
  const tokenized = tokenizeRegex(input)
  const errors = [...tokenized.errors]
  const tokens = tokenized.tokens
  const stack = []

  if (!tokenized.ok) {
    return { ok: false, tokens, errors }
  }

  tokens.forEach((token, index) => {
    const previous = tokens[index - 1]
    const next = tokens[index + 1]

    if (token.value === '(') {
      stack.push(token)
      if (next?.value === ')') {
        errors.push({ position: token.position, token: '()', reason: 'Empty group is not allowed.' })
      }
    }

    if (token.value === ')') {
      const opening = stack.pop()
      if (!opening) {
        errors.push({ position: token.position, token: ')', reason: 'Closing ")" has no matching opening parenthesis.' })
      }
      if (!previous || previous.value === '(' || previous.value === '|') {
        errors.push({ position: token.position, token: ')', reason: 'Group is missing an expression before ")".' })
      }
    }

    if (token.value === '|') {
      if (!previous || previous.value === '(' || previous.value === '|') {
        errors.push({ position: token.position, token: '|', reason: 'Union operator is missing a left operand.' })
      }
      if (!next || next.value === ')' || next.value === '|') {
        errors.push({ position: token.position, token: '|', reason: 'Union operator is missing a right operand.' })
      }
    }

    if (token.value === '*') {
      if (!previous || !isOperandEnd(previous)) {
        errors.push({ position: token.position, token: '*', reason: 'Kleene star is missing a valid operand.' })
      }
    }

    if (isRegexSymbolToken(token) && next && (next.value === '|' || next.value === ')' || next.value === '*')) {
      return
    }

    if (token.value === '(' && next && !isOperandStart(next) && next.value !== '(') {
      errors.push({ position: next.position, token: next.value, reason: 'Opening parenthesis must be followed by an operand or another group.' })
    }
  })

  stack.forEach((token) => {
    errors.push({ position: token.position, token: '(', reason: `Opening "(" at position ${token.position} has no matching ")".` })
  })

  const last = tokens.at(-1)
  if (last && (last.value === '|' || last.value === '(')) {
    errors.push({ position: last.position, token: last.value, reason: 'Regular Expression ends with an incomplete operator or group.' })
  }

  return { ok: errors.length === 0, tokens, errors }
}
