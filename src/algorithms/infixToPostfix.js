const PRECEDENCE = {
  '|': 1,
  '.': 2,
  '*': 3,
}

function isOperator(value) {
  return value === '|' || value === '.' || value === '*'
}

export function infixToPostfix(tokens) {
  const output = []
  const operatorStack = []
  const steps = []

  tokens.forEach((token) => {
    if (token.type === 'SYMBOL' || token.type === 'EPSILON') {
      output.push(token)
      steps.push({ token: token.value, action: 'Add operand to output', operatorStack: operatorStack.map((item) => item.value), output: output.map((item) => item.value) })
      return
    }

    if (token.value === '(') {
      operatorStack.push(token)
      steps.push({ token: token.value, action: 'Push opening parenthesis', operatorStack: operatorStack.map((item) => item.value), output: output.map((item) => item.value) })
      return
    }

    if (token.value === ')') {
      while (operatorStack.length && operatorStack.at(-1).value !== '(') {
        output.push(operatorStack.pop())
      }
      operatorStack.pop()
      steps.push({ token: token.value, action: 'Pop operators until opening parenthesis', operatorStack: operatorStack.map((item) => item.value), output: output.map((item) => item.value) })
      return
    }

    if (isOperator(token.value)) {
      while (
        operatorStack.length &&
        isOperator(operatorStack.at(-1).value) &&
        PRECEDENCE[operatorStack.at(-1).value] >= PRECEDENCE[token.value]
      ) {
        output.push(operatorStack.pop())
      }
      operatorStack.push(token)
      steps.push({ token: token.value, action: `Push operator ${token.value}`, operatorStack: operatorStack.map((item) => item.value), output: output.map((item) => item.value) })
    }
  })

  while (operatorStack.length) {
    output.push(operatorStack.pop())
  }

  steps.push({ token: 'end', action: 'Pop remaining operators', operatorStack: [], output: output.map((item) => item.value) })
  return { postfix: output, steps }
}
