import { useMemo, useState } from 'react'
import { setDisplay } from '../algorithms/syntaxTreeAttributes'

const OPERATOR_WIDTH = 136
const LEAF_WIDTH = 124
const OPERATOR_HEIGHT = 108
const LEAF_HEIGHT = 100
const HORIZONTAL_GAP = 24
const VERTICAL_GAP = 20
const VIEW_PADDING = 24

function childrenOf(node) {
  return [node.left, node.child, node.right].filter(Boolean)
}

function nodeLabel(node) {
  if (node.type === 'LEAF') return node.symbol
  if (node.type === 'EPSILON') return '\u03b5'
  if (node.type === 'UNION') return '|'
  if (node.type === 'CONCAT') return '.'
  return '*'
}

function nodeWidth(node) {
  return node.type === 'LEAF' || node.type === 'EPSILON' ? LEAF_WIDTH : OPERATOR_WIDTH
}

function nodeHeight(node) {
  return node.type === 'LEAF' || node.type === 'EPSILON' ? LEAF_HEIGHT : OPERATOR_HEIGHT
}

function createLayout(root) {
  const dimensions = new Map()

  function measure(node) {
    const children = childrenOf(node)
    const childSizes = children.map(measure)
    const childrenWidth = childSizes.reduce((sum, child) => sum + child.width, 0) + Math.max(0, children.length - 1) * HORIZONTAL_GAP
    const width = Math.max(nodeWidth(node), childrenWidth)
    const height = children.length
      ? nodeHeight(node) + VERTICAL_GAP + Math.max(...childSizes.map((child) => child.height))
      : nodeHeight(node)
    const size = { width, height }
    dimensions.set(node.id, size)
    return size
  }

  measure(root)
  const nodes = []
  const edges = []

  function place(node, left, y, parent = null) {
    const size = dimensions.get(node.id)
    const children = childrenOf(node)
    const childrenWidth = children.reduce((sum, child) => sum + dimensions.get(child.id).width, 0) + Math.max(0, children.length - 1) * HORIZONTAL_GAP
    let cursor = left + (size.width - childrenWidth) / 2
    const childItems = []

    children.forEach((child) => {
      const childSize = dimensions.get(child.id)
      childItems.push(place(child, cursor, y + nodeHeight(node) + VERTICAL_GAP, node))
      cursor += childSize.width + HORIZONTAL_GAP
    })

    const x = childItems.length === 2
      ? (childItems[0].x + childItems[1].x) / 2
      : childItems.length === 1
        ? childItems[0].x
        : left + size.width / 2
    const item = { node, x, y, width: nodeWidth(node), height: nodeHeight(node) }
    nodes.push(item)
    if (parent) edges.push({ parent, child: node })
    return item
  }

  const rootSize = dimensions.get(root.id)
  place(root, 0, 0)
  const minX = Math.min(...nodes.map((item) => item.x - item.width / 2))
  const maxX = Math.max(...nodes.map((item) => item.x + item.width / 2))
  const minY = Math.min(...nodes.map((item) => item.y))
  const maxY = Math.max(...nodes.map((item) => item.y + item.height))

  return {
    nodes,
    edges,
    width: rootSize.width,
    height: rootSize.height,
    viewBox: {
      x: minX - VIEW_PADDING,
      y: minY - VIEW_PADDING,
      width: maxX - minX + VIEW_PADDING * 2,
      height: maxY - minY + VIEW_PADDING * 2,
    },
  }
}

function edgePath(parent, child) {
  const startX = parent.x
  const startY = parent.y + parent.height
  const endX = child.x
  const endY = child.y
  const middleY = startY + (endY - startY) / 2
  return `M ${startX} ${startY} V ${middleY} H ${endX} V ${endY}`
}

function TreeNode({ item, selected, onSelect }) {
  const { node, x, y, width, height } = item
  const isLeaf = node.type === 'LEAF' || node.type === 'EPSILON'
  return (
    <g
      className={`syntax-tree-node ${isLeaf ? `leaf ${node.symbol === '#' ? 'end-marker' : ''}` : `operator ${node.type.toLowerCase()}`} ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(node)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect(node)
      }}
      role="button"
      tabIndex={0}
    >
      <title>{node.type} {nodeLabel(node)}</title>
      <rect x={x - width / 2} y={y} width={width} height={height} rx="10" />
      <text x={x} y={y + 22} className="syntax-tree-symbol" textAnchor="middle">{nodeLabel(node)}</text>
      <text x={x} y={y + 40} className="syntax-tree-type" textAnchor="middle">
        {isLeaf ? (node.type === 'EPSILON' ? 'EPSILON' : `pos ${node.position}`) : node.type}
      </text>
      <text x={x} y={y + 59} className="syntax-tree-attribute" textAnchor="middle">nullable: {String(node.nullable)}</text>
      <text x={x} y={y + 77} className="syntax-tree-attribute" textAnchor="middle">first: {setDisplay(node.firstpos)}</text>
      <text x={x} y={y + 95} className="syntax-tree-attribute" textAnchor="middle">last: {setDisplay(node.lastpos)}</text>
    </g>
  )
}

function NodeDetails({ node }) {
  if (!node) return <p className="muted">Click a node to inspect its direct-method attributes.</p>
  return (
    <div className="tree-details-content">
      <div><span>Symbol</span><strong>{nodeLabel(node)}</strong></div>
      <div><span>Type</span><strong>{node.type}</strong></div>
      {node.position && <div><span>Position</span><strong>{node.position}</strong></div>}
      <div><span>nullable</span><strong>{String(node.nullable)}</strong></div>
      <div><span>firstpos</span><strong>{setDisplay(node.firstpos)}</strong></div>
      <div><span>lastpos</span><strong>{setDisplay(node.lastpos)}</strong></div>
    </div>
  )
}

export default function SyntaxTreeView({ root }) {
  const [zoom, setZoom] = useState(1)
  const [selected, setSelected] = useState(null)
  const layout = useMemo(() => (root ? createLayout(root) : null), [root])
  if (!root || !layout) return null

  const nodeMap = new Map(layout.nodes.map((item) => [item.node.id, item]))
  const { viewBox } = layout
  const zoomViewBox = {
    width: viewBox.width / zoom,
    height: viewBox.height / zoom,
    x: viewBox.x + (viewBox.width - viewBox.width / zoom) / 2,
    y: viewBox.y,
  }

  return (
    <section className="panel syntax-tree-panel">
      <div className="panel-heading">
        <div>
          <p className="stage-label">Stage E</p>
          <h2>Syntax Tree</h2>
          <p className="muted">Compact AST view. Select a node to inspect its direct-method attributes.</p>
        </div>
        <div className="button-row compact tree-controls" aria-label="Syntax tree view controls">
          <button type="button" onClick={() => setZoom((value) => Math.max(0.75, value - 0.1))}>−</button>
          <button type="button" onClick={() => setZoom(1)}>Fit Tree</button>
          <button type="button" onClick={() => setZoom((value) => Math.min(1.8, value + 0.1))}>+</button>
        </div>
      </div>
      <div className="syntax-tree-scroll">
        <svg
          className="syntax-tree-svg"
          viewBox={`${zoomViewBox.x} ${zoomViewBox.y} ${zoomViewBox.width} ${zoomViewBox.height}`}
          preserveAspectRatio="xMidYMin meet"
          role="img"
          aria-label="Hierarchical syntax tree"
        >
          {layout.edges.map(({ parent, child }) => {
            const parentItem = nodeMap.get(parent.id)
            const childItem = nodeMap.get(child.id)
            return <path key={`${parent.id}-${child.id}`} className="syntax-tree-edge" d={edgePath(parentItem, childItem)} />
          })}
          {layout.nodes.map((item) => <TreeNode key={item.node.id} item={item} selected={selected?.id === item.node.id} onSelect={setSelected} />)}
        </svg>
      </div>
      <aside className="tree-details" aria-live="polite">
        <h3>Node Details</h3>
        <NodeDetails node={selected} />
      </aside>
    </section>
  )
}
