export default function ParseResult({ result, inputString, startSymbol }) {
  if (!result) {
    return null
  }

  return (
    <div className={`alert ${result.accepted ? 'success' : 'error'}`}>
      <h3>{result.accepted ? 'Input Accepted' : 'Input Rejected'}</h3>
      <p>Input: {inputString}</p>
      <p>Start Symbol: {startSymbol}</p>
      <p>Total Steps: {result.steps.length}</p>
      <p>Result: {result.accepted ? 'Accepted by the Operator Precedence Parser.' : result.reason}</p>
    </div>
  )
}
