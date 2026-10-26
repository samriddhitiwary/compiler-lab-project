function union(...sets) {
  return [...new Set(sets.flat())].sort((a, b) => a - b)
}

export function computeSyntaxTreeAttributes(node) {
  if (!node) return null

  if (node.type === 'LEAF') {
    node.nullable = false
    node.firstpos = [node.position]
    node.lastpos = [node.position]
    return node
  }

  if (node.type === 'EPSILON') {
    node.nullable = true
    node.firstpos = []
    node.lastpos = []
    return node
  }

  if (node.type === 'STAR') {
    computeSyntaxTreeAttributes(node.child)
    node.nullable = true
    node.firstpos = [...node.child.firstpos]
    node.lastpos = [...node.child.lastpos]
    return node
  }

  computeSyntaxTreeAttributes(node.left)
  computeSyntaxTreeAttributes(node.right)

  if (node.type === 'UNION') {
    node.nullable = node.left.nullable || node.right.nullable
    node.firstpos = union(node.left.firstpos, node.right.firstpos)
    node.lastpos = union(node.left.lastpos, node.right.lastpos)
  }

  if (node.type === 'CONCAT') {
    node.nullable = node.left.nullable && node.right.nullable
    node.firstpos = node.left.nullable ? union(node.left.firstpos, node.right.firstpos) : [...node.left.firstpos]
    node.lastpos = node.right.nullable ? union(node.left.lastpos, node.right.lastpos) : [...node.right.lastpos]
  }

  return node
}

export function setDisplay(values) {
  return values?.length ? `{${values.join(',')}}` : '∅'
}
