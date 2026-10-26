# Compiler Design Visualization Tool

Project 8 for BCSE307P Compiler Design Lab.

Student: Samriddhi Tiwary  
Registration Number: 23BCE0661  
Department: SCOPE

## Project Overview

This React + Vite application visualizes two compiler-design workflows:

1. Bottom-Up Parsing using Operator Precedence Parsing
2. Regular Expression to DFA conversion using the Direct Method

All algorithms run locally in the browser. There is no backend, database, NFA construction, or hardcoded DFA.

## Review 1

Implemented:

- Grammar input and parsing
- Operator grammar validation
- LEADING and TRAILING calculation
- Step-by-step set visualization
- Operator precedence table construction
- Conflict detection

## Review 2

Implemented:

- Generic input tokenization
- Shift/reduce operator-precedence parser
- Topmost-terminal detection
- Handle boundary detection
- Production matching
- Parsing trace
- ACCEPT/REJECT result
- Parser loop protection
- Automated parser tests

## Review 3

Implemented:

- Regular Expression input and validation
- Explicit concatenation insertion
- Augmented Regular Expression with `#`
- Infix-to-postfix conversion
- Syntax Tree construction
- Polished adaptive SVG syntax-tree layout with zoom and node inspection
- Leaf-position numbering
- nullable, firstpos, lastpos
- followpos table and update steps
- Kleene closure, including nested/repeated `*`
- Empty-string acceptance when the start state is final
- Direct DFA construction
- DFA transition table
- DFA graph visualization
- DFA string simulation, including empty-string testing
- Automated direct-method tests, invariants, and exhaustive small-string cross-checks

## Operator Precedence Parser Theory

The parser compares the topmost terminal on the stack with the next input terminal. A `<` or `=` relation means SHIFT. A `>` relation means REDUCE. During reduction, the parser scans left through stack terminals until it finds the nearest `<` boundary, extracts the handle, matches it with a grammar production, and replaces it by the production LHS.

This module supports valid operator-precedence grammars representable by the tokenizer. It is not a general parser for arbitrary context-free grammars.

## RE to DFA Direct Method Theory

The Direct Method constructs a DFA directly from the augmented regular-expression syntax tree.

1. Tokenize and validate the Regular Expression.
2. Insert explicit concatenation operators.
3. Augment the expression as `(r).#`.
4. Convert infix expression to postfix.
5. Build the Syntax Tree from postfix.
6. Assign a unique leaf position to every non-epsilon symbol, including `#`.
7. Compute nullable, firstpos, and lastpos bottom-up.
8. Compute followpos using only concatenation and Kleene-star rules.
9. Use firstpos(root) as the initial DFA state.
10. For each state and alphabet symbol, union followpos of matching positions to form transitions.
11. Mark every state containing the `#` position as final.

For `R*`, the direct method applies `nullable = true`, copies the child `firstpos` and `lastpos`, and adds `firstpos(R)` to `followpos(i)` for each `i` in `lastpos(R)`. The page exposes the workflow through Previous, Next Step, Compute All, and Reset Steps controls.

Epsilon has no leaf position. Repeated symbols receive separate positions.

## Supported Grammar Notation

Compact:

```txt
E -> E+T | T
T -> T*F | F
F -> (E) | i
```

Token-separated:

```txt
Expr -> Expr '+' Term | Term
Term -> Term '*' Factor | Factor
Factor -> '(' Expr ')' | 'id'
```

## Supported Regular Expression Syntax

- Union: `|`
- Concatenation: implicit in input, explicit as `.` internally
- Kleene star: `*`
- Grouping: `( )`
- Epsilon: `ε`, `epsilon`, or `eps`
- Quoted multi-character symbols: `'id'`, `'num'`

The user must not enter `#`; it is reserved for augmentation.

## Installation

```bash
npm install
```

## Running Project

```bash
npm run dev
```

## Running Tests

```bash
npm test
npm run build
npm run lint
```

## Example Regular Expressions

```txt
a
a*
a|b
ab
(a|b)*
(a|b)*abb
a(b|c)*
(ab)*
a**
a|ε
'id'|'num'
```

## Known Limitations

- The Operator Precedence Parser is for valid operator-precedence grammars, not arbitrary CFGs.
- The RE module supports direct-method operators `|`, concatenation, `*`, grouping, and epsilon.
- Extended operators such as `+` and `?` are intentionally not enabled to keep the direct-method implementation focused and testable.
- Very large expressions are limited to protect the browser from excessive syntax-tree or DFA growth.

## Final Directory Structure

```txt
src/
  algorithms/
    __tests__/
      operatorPrecedenceParser.test.js
      regexDirectMethod.test.js
    concatenationInserter.js
    dfaSimulator.js
    directDfa.js
    followpos.js
    grammarParser.js
    grammarValidator.js
    handleFinder.js
    infixToPostfix.js
    inputTokenizer.js
    leading.js
    operatorPrecedenceParser.js
    precedenceTable.js
    productionMatcher.js
    regexDirectMethod.js
    regexTokenizer.js
    regexValidator.js
    symbolUtils.js
    syntaxTree.js
    syntaxTreeAttributes.js
    trailing.js
    unitProductionUtils.js
  components/
    AttributeTable.jsx
    ComputationExplanation.jsx
    ConflictAlert.jsx
    DfaConstructionSteps.jsx
    DfaGraph.jsx
    DfaSimulationTrace.jsx
    DfaStringTester.jsx
    DfaTransitionTable.jsx
    FollowposTable.jsx
    GrammarInput.jsx
    GrammarValidation.jsx
    LeadingTrailingTable.jsx
    Navbar.jsx
    ParseExplanation.jsx
    ParseResult.jsx
    ParserStack.jsx
    ParsingTrace.jsx
    PrecedenceTable.jsx
    ProjectStatus.jsx
    RegexInput.jsx
    RegexSteps.jsx
    StageIndicator.jsx
    StepControls.jsx
    StringInput.jsx
    SyntaxTreeView.jsx
  pages/
    BottomUpParsing.jsx
    Home.jsx
    OperatorPrecedence.jsx
    RegexToDFA.jsx
```
