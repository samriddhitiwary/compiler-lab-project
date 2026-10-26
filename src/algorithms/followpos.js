import { setDisplay } from './syntaxTreeAttributes.js'

function addAll(target, values) {
  let changed = false
  values.forEach((value) => {
    if (!target.has(value)) {
      target.add(value)
      changed = true
    }
  })
  return changed
}

export function computeFollowpos(root, positionToSymbol) {
  const followpos = Object.fromEntries(Object.keys(positionToSymbol).map((position) => [Number(position), new Set()]))
  const steps = []

  function visit(node) {
    if (!node) return

    visit(node.left)
    visit(node.child)
    visit(node.right)

    if (node.type === 'CONCAT') {
      node.left.lastpos.forEach((position) => {
        const before = [...followpos[position]]
        const changed = addAll(followpos[position], node.right.firstpos)
        if (changed) {
          steps.push({
            nodeId: node.id,
            nodeType: 'CONCAT',
            rule: 'For concatenation c1.c2, for every i in lastpos(c1), add firstpos(c2) to followpos(i).',
            affectedPosition: position,
            addedPositions: [...node.right.firstpos],
            before,
            after: [...followpos[position]].sort((a, b) => a - b),
            explanation: `Node ${node.id}: lastpos(left) contains ${position}, so add ${setDisplay(node.right.firstpos)} to followpos(${position}).`,
          })
        }
      })
    }

    if (node.type === 'STAR') {
      node.child.lastpos.forEach((position) => {
        const before = [...followpos[position]]
        const changed = addAll(followpos[position], node.child.firstpos)
        if (changed) {
          steps.push({
            nodeId: node.id,
            nodeType: 'STAR',
            rule: 'For star node c*, for every i in lastpos(c), add firstpos(c) to followpos(i).',
            affectedPosition: position,
            addedPositions: [...node.child.firstpos],
            before,
            after: [...followpos[position]].sort((a, b) => a - b),
            explanation: `Node ${node.id}: lastpos(child) contains ${position}, so add ${setDisplay(node.child.firstpos)} to followpos(${position}).`,
          })
        }
      })
    }
  }

  visit(root)

  return {
    followpos: Object.fromEntries(Object.entries(followpos).map(([position, values]) => [position, [...values].sort((a, b) => a - b)])),
    steps,
  }
}
