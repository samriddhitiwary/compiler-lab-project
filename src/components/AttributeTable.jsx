import { setDisplay } from '../algorithms/syntaxTreeAttributes'

function nodeName(node) {
  if (node.type === 'LEAF') return `${node.symbol}${node.position}`
  if (node.type === 'EPSILON') return 'ε'
  if (node.type === 'UNION') return '|'
  if (node.type === 'CONCAT') return '.'
  return '*'
}

export default function AttributeTable({ nodes }) {
  if (!nodes?.length) return null
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="stage-label">Stage F</p>
          <h2>nullable / firstpos / lastpos</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Node</th>
              <th>Type</th>
              <th>nullable</th>
              <th>firstpos</th>
              <th>lastpos</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr key={node.id}>
                <td>{nodeName(node)}</td>
                <td>{node.type}</td>
                <td>{String(node.nullable)}</td>
                <td>{setDisplay(node.firstpos)}</td>
                <td>{setDisplay(node.lastpos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
