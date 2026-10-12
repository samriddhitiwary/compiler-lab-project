export const sampleGrammars = {
  validExpression: `E -> E+T | T
T -> T*F | F
F -> (E) | i`,
  invalidAdjacent: `S -> AB
A -> a
B -> b`,
  invalidEpsilon: `S -> aA | epsilon
A -> b`,
  simpleValid: `S -> aAb
A -> c`,
  conflict: `S -> aA | Aa
A -> a`,
}

export const testCases = [
  {
    name: 'Valid expression grammar',
    grammar: sampleGrammars.validExpression,
    expected: 'Valid operator grammar, LEADING/TRAILING sets, and precedence table generated.',
  },
  {
    name: 'Adjacent non-terminals',
    grammar: sampleGrammars.invalidAdjacent,
    expected: 'Rejected because S -> AB contains adjacent non-terminals.',
  },
  {
    name: 'Epsilon production',
    grammar: sampleGrammars.invalidEpsilon,
    expected: 'Rejected because epsilon productions are not allowed.',
  },
  {
    name: 'Simple valid grammar',
    grammar: sampleGrammars.simpleValid,
    expected: 'Valid grammar with relation a = b from S -> aAb.',
  },
  {
    name: 'Conflict grammar',
    grammar: sampleGrammars.conflict,
    expected: 'Valid operator grammar syntax, but precedence table reports a conflict for a and a.',
  },
]
