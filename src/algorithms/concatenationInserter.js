import { isRegexSymbolToken } from './regexTokenizer.js'

function canEndConcat(token) {
  return token && (isRegexSymbolToken(token) || token.value === ')' || token.value === '*')
}

function canStartConcat(token) {
  return token && (isRegexSymbolToken(token) || token.value === '(')
}

export function insertExplicitConcatenation(tokens) {
  const output = []
  const steps = []

  tokens.forEach((token, index) => {
    const previous = tokens[index - 1]
    if (previous && canEndConcat(previous) && canStartConcat(token)) {
      const concatToken = { type: 'OPERATOR', value: '.', position: token.position, inserted: true }
      output.push(concatToken)
      steps.push({
        left: previous.value,
        right: token.value,
        action: `Insert "." between ${previous.value} and ${token.value}.`,
        output: output.map((item) => item.value),
      })
    }
    output.push(token)
  })

  return { tokens: output, steps }
}

export function augmentRegex(explicitTokens) {
  return [
    { type: 'OPERATOR', value: '(', position: -1, inserted: true },
    ...explicitTokens,
    { type: 'OPERATOR', value: ')', position: -1, inserted: true },
    { type: 'OPERATOR', value: '.', position: -1, inserted: true },
    { type: 'SYMBOL', value: '#', position: -1, augmented: true },
  ]
}
