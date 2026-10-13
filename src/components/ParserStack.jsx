export default function ParserStack({ stack = [], handle = [], handleStartIndex = null, topTerminal }) {
  const computedHandleIndexes = new Set()
  if (handle?.length && Number.isInteger(handleStartIndex)) {
    for (let offset = 0; offset < handle.length; offset += 1) {
      computedHandleIndexes.add(handleStartIndex + offset)
    }
  } else if (handle?.length) {
    for (let index = 0; index <= stack.length - handle.length; index += 1) {
      if (stack.slice(index, index + handle.length).join('\u0001') === handle.join('\u0001')) {
        for (let offset = 0; offset < handle.length; offset += 1) {
          computedHandleIndexes.add(index + offset)
        }
      }
    }
  }

  return (
    <div className="stack-box-row">
      {stack.map((symbol, index) => {
        const isTerminal = symbol === '$' || !/^[A-Z][A-Za-z0-9']*$/.test(symbol)
        const classes = [
          'stack-box',
          isTerminal ? 'terminal-box' : 'nonterminal-box',
          symbol === topTerminal ? 'top-terminal-box' : '',
          computedHandleIndexes.has(index) ? 'handle-box' : '',
        ].join(' ')

        return (
          <span className={classes} key={`${symbol}-${index}`}>
            {symbol}
          </span>
        )
      })}
    </div>
  )
}
