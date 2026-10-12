export default function ConflictAlert({ conflicts }) {
  if (!conflicts.length) {
    return (
      <div className="alert success">
        <h3>Grammar Verdict</h3>
        <p>Grammar is an Operator-Precedence Grammar. No precedence conflicts were found.</p>
      </div>
    )
  }

  return (
    <div className="alert warning">
      <h3>Precedence Conflict</h3>
      <p className="verdict">This grammar is NOT an Operator-Precedence Grammar.</p>
      {conflicts.map((conflict, index) => (
        <div className="reason-block" key={`${conflict.pair.join('-')}-${index}`}>
          <p>
            Terminal Pair: ({conflict.pair[0]}, {conflict.pair[1]})
          </p>
          <p>Existing Relation: {conflict.existingRelations.join(', ')}</p>
          <p>New Relation: {conflict.newRelation}</p>
          <p className="code-line">{conflict.newSource.production}</p>
          <p>{conflict.newSource.explanation}</p>
        </div>
      ))}
    </div>
  )
}
