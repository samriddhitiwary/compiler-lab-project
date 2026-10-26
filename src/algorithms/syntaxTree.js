import { EPSILON } from './regexTokenizer.js'

let nextNodeId = 1

function makeNode(type, fields = {}) {
  return {
    id: `n${nextNodeId++}`,
    type,
    symbol: fields.symbol ?? null,
    position: fields.position ?? null,
    left: fields.left ?? null,
    right: fields.right ?? null,
    child: fields.child ?? null,
    nullable: false,
    firstpos: [],
    lastpos: [],
  }
}

export function buildSyntaxTree(postfixTokens) {
  nextNodeId = 1
  const stack = []
  const positionToSymbol = {}
  const symbolToPositions = {}
  let nextPosition = 1
  let hashPosition = null

  postfixTokens.forEach((token) => {
    if (token.type === 'EPSILON' || token.value === EPSILON) {
      stack.push(makeNode('EPSILON', { symbol: EPSILON }))
      return
    }

    if (token.type === 'SYMBOL') {
      const position = nextPosition
      nextPosition += 1
      positionToSymbol[position] = token.value
      symbolToPositions[token.value] ??= []
      symbolToPositions[token.value].push(position)
      if (token.value === '#') {
        hashPosition = position
      }
      stack.push(makeNode('LEAF', { symbol: token.value, position }))
      return
    }

    if (token.value === '*') {
      const child = stack.pop()
      stack.push(makeNode('STAR', { child }))
      return
    }

    if (token.value === '|' || token.value === '.') {
      const right = stack.pop()
      const left = stack.pop()
      stack.push(makeNode(token.value === '|' ? 'UNION' : 'CONCAT', { left, right }))
    }
  })

  if (stack.length !== 1) {
    throw new Error('Postfix expression did not reduce to a single syntax tree.')
  }

  return {
    root: stack[0],
    positionToSymbol,
    symbolToPositions,
    hashPosition,
  }
}

export function flattenSyntaxTree(root) {
  const nodes = []
  function visit(node) {
    if (!node) return
    visit(node.left)
    visit(node.child)
    visit(node.right)
    nodes.push(node)
  }
  visit(root)
  return nodes
}
