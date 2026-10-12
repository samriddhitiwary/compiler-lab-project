# Interactive GUI for Operator Precedence Parsing

Project 8 for BCSE307P Compiler Design Lab.

Student: Samriddhi Tiwary  
Registration Number: 23BCE0661  
Department: SCOPE

## Description

This React + Vite application is a modern educational Compiler Design Visualization Tool. Review 1 implements the Operator Precedence Parsing portion of the project only. All algorithms run locally in the browser with no backend, database, or authentication.

## Review-1 Scope

Implemented for Review 1:

- Grammar input and parsing
- Operator grammar validation
- LEADING set calculation
- TRAILING set calculation
- Step-by-step LEADING and TRAILING visualization
- Operator precedence table construction
- Step-by-step precedence relation insertion
- Conflict detection
- Valid, invalid, epsilon, simple, and conflict grammar samples
- Reset functionality

Not implemented in Review 1:

- Shift/reduce input string parser
- LR parser algorithms
- Regular Expression to DFA using Direct Method
- Backend or database

## Technologies

- React
- Vite
- JavaScript
- CSS

## Installation

```bash
npm install
npm run dev
```

## Example Grammar

```txt
E -> E+T | T
T -> T*F | F
F -> (E) | i
```

Unicode arrows are also supported:

```txt
E -> E+T | T
```

## Project Directory Structure

```txt
src/
  algorithms/
    grammarParser.js
    grammarValidator.js
    leading.js
    precedenceTable.js
    symbolUtils.js
    trailing.js
  components/
    ComputationExplanation.jsx
    ConflictAlert.jsx
    GrammarInput.jsx
    GrammarValidation.jsx
    LeadingTrailingTable.jsx
    Navbar.jsx
    PrecedenceTable.jsx
    ProjectStatus.jsx
    StageIndicator.jsx
    StepControls.jsx
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

## Current Project Status

Review 1 is implemented as a functional frontend prototype. The grammar algorithms are separated from React UI components so each compiler-design step can be explained clearly during viva.

## Future Work

- Step-by-step shift/reduce string parsing
- Complete parsing trace
- ACCEPT/REJECT visualization
- Regular Expression to DFA using Direct Method
- Final integration and extended testing
