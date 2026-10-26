import { describe, expect, test } from 'vitest'
import { insertExplicitConcatenation } from '../concatenationInserter.js'
import { simulateDfa } from '../dfaSimulator.js'
import { buildRegexDirectMethod } from '../regexDirectMethod.js'
import { tokenizeRegex } from '../regexTokenizer.js'
import { validateRegex } from '../regexValidator.js'

function accepts(regex, input) {
  const result = buildRegexDirectMethod(regex)
  expect(result.ok, regex).toBe(true)
  return simulateDfa(result.dfa, input).accepted
}

function allStrings(alphabet, maxLength) {
  const output = ['']
  function build(prefix, remaining) {
    if (remaining === 0) return
    alphabet.forEach((symbol) => {
      const next = prefix + symbol
      output.push(next)
      build(next, remaining - 1)
    })
  }
  build('', maxLength)
  return output
}

describe('regex tokenizer, validation, and concatenation', () => {
  test('tokenizes quoted multi-character symbols', () => {
    expect(tokenizeRegex("'id'|'num'").tokens.map((token) => token.value)).toEqual(['id', '|', 'num'])
  })

  test('rejects malformed regular expressions', () => {
    ;['|a', 'a|', 'a||', '()', '*a', '(a|b', 'a|b)', 'a#b'].forEach((regex) => {
      expect(validateRegex(regex).ok, regex).toBe(false)
    })
  })

  test('inserts explicit concatenation correctly', () => {
    const tokens = tokenizeRegex('(a|b)*abb').tokens
    expect(insertExplicitConcatenation(tokens).tokens.map((token) => token.value).join('')).toBe('(a|b)*.a.b.b')
  })
})

describe('direct-method DFA languages', () => {
  test('recognizes a', () => {
    expect(accepts('a', 'a')).toBe(true)
    expect(accepts('a', '')).toBe(false)
    expect(accepts('a', 'aa')).toBe(false)
    expect(accepts('a', 'b')).toBe(false)
  })

  test('recognizes a star', () => {
    ;['', 'a', 'aa', 'aaa'].forEach((input) => expect(accepts('a*', input), input).toBe(true))
    expect(accepts('a*', 'b')).toBe(false)
  })

  test('recognizes union and concatenation', () => {
    expect(accepts('a|b', 'a')).toBe(true)
    expect(accepts('a|b', 'b')).toBe(true)
    expect(accepts('a|b', 'ab')).toBe(false)
    expect(accepts('ab', 'ab')).toBe(true)
    expect(accepts('ab', 'a')).toBe(false)
    expect(accepts('ab', 'abb')).toBe(false)
  })

  test('recognizes closure and suffix expression', () => {
    ;['', 'a', 'b', 'abba', 'abab'].forEach((input) => expect(accepts('(a|b)*', input), input).toBe(true))
    ;['abb', 'aabb', 'babb', 'abababb'].forEach((input) => expect(accepts('(a|b)*abb', input), input).toBe(true))
    ;['ab', 'abba', 'abc', ''].forEach((input) => expect(accepts('(a|b)*abb', input), input).toBe(false))
  })

  test('recognizes repeated and nested Kleene stars', () => {
    ;['', 'a', 'aa', 'aaa'].forEach((input) => expect(accepts('a**', input), input).toBe(true))
    ;['', 'a', 'aa', 'aaa'].forEach((input) => expect(accepts('(a*)*', input), input).toBe(true))
    ;['', 'ab', 'abab', 'ababab'].forEach((input) => expect(accepts('(ab)*', input), input).toBe(true))
    ;['a', 'b', 'aba', 'abb'].forEach((input) => expect(accepts('(ab)*', input), input).toBe(false))
    ;['', 'ab', 'c', 'abc', 'ccab'].forEach((input) => expect(accepts('(ab|c)*', input), input).toBe(true))
  })

  test('recognizes a followed by b or c star', () => {
    ;['a', 'ab', 'ac', 'abc', 'acb', 'abcbcc'].forEach((input) => expect(accepts('a(b|c)*', input), input).toBe(true))
    ;['', 'b', 'ba', 'aa'].forEach((input) => expect(accepts('a(b|c)*', input), input).toBe(false))
  })

  test('supports epsilon without assigning it a position', () => {
    const result = buildRegexDirectMethod('a|ε')
    expect(result.ok).toBe(true)
    expect(Object.values(result.positionToSymbol)).not.toContain('ε')
    expect(simulateDfa(result.dfa, '').accepted).toBe(true)
    expect(simulateDfa(result.dfa, 'a').accepted).toBe(true)
    expect(simulateDfa(result.dfa, 'aa').accepted).toBe(false)
  })

  test('supports quoted symbols in DFA simulation', () => {
    const result = buildRegexDirectMethod("'id'|'num'")
    expect(result.ok).toBe(true)
    expect(simulateDfa(result.dfa, 'id').accepted).toBe(true)
    expect(simulateDfa(result.dfa, 'num').accepted).toBe(true)
    expect(simulateDfa(result.dfa, 'idnum').accepted).toBe(false)
  })
})

describe('direct-method invariants and cross-checks', () => {
  test('builds the expected states and transitions for the review example', () => {
    const result = buildRegexDirectMethod('(a|b)*abb')
    expect(result.dfa.states.map((state) => `${state.name}=${state.positions.join(',')}`)).toEqual([
      'D0=1,2,3',
      'D1=1,2,3,4',
      'D2=1,2,3,5',
      'D3=1,2,3,6',
    ])
    expect(result.dfa.transitions).toEqual({
      D0: { a: 'D1', b: 'D0' },
      D1: { a: 'D1', b: 'D2' },
      D2: { a: 'D1', b: 'D3' },
      D3: { a: 'D1', b: 'D0' },
    })
    expect(result.dfa.finalStates).toEqual(['D3'])
  })

  test('keeps STAR unary and computes its attributes and followpos', () => {
    const result = buildRegexDirectMethod('a*')
    const star = result.tree.left
    expect(star.type).toBe('STAR')
    expect(star.child.type).toBe('LEAF')
    expect(star.nullable).toBe(true)
    expect(star.firstpos).toEqual([1])
    expect(star.lastpos).toEqual([1])
    expect(result.followpos[1]).toEqual([1, 2])
    expect(simulateDfa(result.dfa, '').accepted).toBe(true)
  })

  test('renders every required grammar form as a real tree', () => {
    ;['a', 'a*', 'a|b', 'ab', '(a|b)*', '(a|b)*abb', 'a(b|c)*', '(ab|c)*', 'a**'].forEach((regex) => {
      const result = buildRegexDirectMethod(regex)
      expect(result.ok, regex).toBe(true)
      const visit = (node) => {
        const children = [node.left, node.child, node.right].filter(Boolean)
        if (node.type === 'STAR') expect(children).toHaveLength(1)
        if (node.type === 'UNION' || node.type === 'CONCAT') expect(children).toHaveLength(2)
        children.forEach(visit)
      }
      visit(result.tree)
    })
  })

  test('satisfies direct-method invariants', () => {
    const result = buildRegexDirectMethod('(a|b)*abb')
    expect(result.ok).toBe(true)
    const positions = Object.keys(result.positionToSymbol).map(Number)
    expect(new Set(positions).size).toBe(positions.length)
    expect(Object.values(result.positionToSymbol).filter((symbol) => symbol === '#')).toHaveLength(1)
    expect(result.hashPosition).toBeTruthy()
    result.treeNodes.forEach((node) => {
      ;[...node.firstpos, ...node.lastpos].forEach((position) => expect(positions).toContain(position))
    })
    Object.values(result.followpos).flat().forEach((position) => expect(positions).toContain(position))
    expect(result.dfa.states[0].positions).toEqual(result.tree.firstpos)
    result.dfa.finalStates.forEach((stateName) => {
      const state = result.dfa.states.find((candidate) => candidate.name === stateName)
      expect(state.positions).toContain(result.hashPosition)
    })
    expect(result.dfa.alphabet).not.toContain('#')
    expect(result.dfa.alphabet).not.toContain('ε')
    const stateKeys = result.dfa.states.map((state) => state.key)
    expect(new Set(stateKeys).size).toBe(stateKeys.length)
    Object.values(result.dfa.transitions).forEach((row) => {
      Object.entries(row).forEach(([symbol, target]) => {
        expect(symbol).not.toBe('#')
        expect(result.dfa.states.map((state) => state.name)).toContain(target)
      })
    })
  })

  test('cross-checks generated DFA against native regex for short strings', () => {
    const cases = ['a*', 'a|b', 'ab', '(a|b)*', '(a|b)*abb']
    cases.forEach((regex) => {
      const result = buildRegexDirectMethod(regex)
      const native = new RegExp(`^(${regex})$`)
      allStrings(['a', 'b'], 5).forEach((input) => {
        expect(simulateDfa(result.dfa, input).accepted, `${regex} on ${input}`).toBe(native.test(input))
      })
    })
  })
})
