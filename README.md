# Interactive GUI for Operator Precedence Parsing

Project 8 for BCSE307P Compiler Design Lab.

Student: Samriddhi Tiwary  
Registration Number: 23BCE0661  
Department: SCOPE

## Description

This React + Vite application is a Compiler Design Visualization Tool for Operator Precedence Parsing. It runs completely in the browser with no backend or database.

This application supports valid operator-precedence grammars that can be represented by the project tokenizer. It is not intended to parse arbitrary context-free grammars.

## Review 1

Implemented:

- Grammar input and parsing
- Operator grammar validation
- LEADING and TRAILING calculation
- Step-by-step LEADING/TRAILING visualization
- Operator precedence table construction
- Step-by-step relation insertion
- Conflict detection
- Grammar verdict
- Sample grammars and reset functionality

## Review 2

Implemented:

- Input string tokenization using grammar terminals
- Longest-match terminal recognition
- Multi-character grammar symbols such as `Expr`, `Term`, `Factor`, and `id`
- Shift/reduce operator-precedence parser
- Topmost-terminal comparison
- Handle boundary detection
- Production-aware handle matching
- Unit-production closure for final acceptance
- Step-by-step parsing trace
- Visual stack and handle highlighting
- ACCEPT/REJECT result cards
- Rejection reasons for invalid input, missing relations, conflicts, ambiguous handles, no matching handle, and parser cycles
- Vitest unit tests for parser algorithms

## Parser Algorithm Summary

The parser initializes the stack as `$` and the input as tokens followed by `$`.

For each step:

1. Find the rightmost terminal on the stack.
2. Compare it with the next input terminal using the generated precedence table.
3. If the relation is `<` or `=`, shift the input terminal.
4. If the relation is `>`, search left through stack terminals until the nearest `<` boundary is found.
5. Extract the handle, including any non-terminals between boundary terminals.
6. Match the handle against grammar productions. Exact RHS matching is tried first, then operator-shape matching where non-terminals behave like placeholders.
7. Replace the handle with the matched production LHS.
8. Accept only when input is exhausted and the stack represents the start symbol, including valid unit-production closure.

## Rejection Conditions

Parsing is rejected or disabled when:

- Grammar syntax is invalid
- Operator grammar validation fails
- LEADING/TRAILING or precedence table is unavailable
- The precedence table contains conflicts
- Input is empty
- Input manually contains `$`
- Input contains an unknown terminal
- No precedence relation exists for the current terminal pair
- A handle cannot be matched to a production
- A reduction is ambiguous
- A non-progressing parser cycle is detected
- The parser exceeds its maximum step limit
- Final stack does not represent the grammar start symbol

## Technologies

- React
- Vite
- JavaScript
- CSS
- Vitest

## Installation

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
npm run build
npm run lint
```

## Example Grammars

Compact notation:

```txt
E -> E+T | T
T -> T*F | F
F -> (E) | i
```

Token-separated notation:

```txt
Expr -> Expr '+' Term | Term
Term -> Term '*' Factor | Factor
Factor -> '(' Expr ')' | 'id'
```

Example inputs:

```txt
i+i*i
(i+i)*i
id + id * id
```

## Project Directory Structure

```txt
src/
  algorithms/
    __tests__/
      operatorPrecedenceParser.test.js
    grammarParser.js
    grammarValidator.js
    handleFinder.js
    inputTokenizer.js
    leading.js
    operatorPrecedenceParser.js
    precedenceTable.js
    productionMatcher.js
    symbolUtils.js
    trailing.js
    unitProductionUtils.js
  components/
    ComputationExplanation.jsx
    ConflictAlert.jsx
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
    StageIndicator.jsx
    StepControls.jsx
    StringInput.jsx
  data/
    sampleGrammars.js
  pages/
    BottomUpParsing.jsx
    Home.jsx
    OperatorPrecedence.jsx
  App.jsx
  index.css
  main.jsx
```

## Future Work

- RE syntax tree
- Augmented RE with `#`
- nullable, firstpos, lastpos, followpos
- Direct DFA construction
- DFA transition table and visualization
- Complete project integration
