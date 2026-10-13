export function tokenizeInput(inputText, terminals) {
  const input = inputText.trim()
  const errors = []

  if (!input) {
    return { ok: false, tokens: [], errors: [{ reason: 'Input string is empty.' }] }
  }

  if (input.includes('$')) {
    return {
      ok: false,
      tokens: [],
      errors: [{ reason: 'Input must not manually contain the end marker "$".' }],
    }
  }

  const sortedTerminals = [...terminals].sort((a, b) => b.length - a.length)
  const tokens = []
  let index = 0

  while (index < input.length) {
    if (/\s/.test(input[index])) {
      index += 1
      continue
    }

    const terminal = sortedTerminals.find((candidate) => input.startsWith(candidate, index))
    if (!terminal) {
      errors.push({
        token: input[index],
        position: index,
        reason: `"${input[index]}" is not a terminal of the grammar.`,
      })
      break
    }

    tokens.push(terminal)
    index += terminal.length
  }

  return {
    ok: errors.length === 0,
    tokens,
    errors,
  }
}
