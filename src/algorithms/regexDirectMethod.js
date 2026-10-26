import { augmentRegex, insertExplicitConcatenation } from './concatenationInserter.js'
import { constructDirectDfa } from './directDfa.js'
import { computeFollowpos } from './followpos.js'
import { infixToPostfix } from './infixToPostfix.js'
import { validateRegex } from './regexValidator.js'
import { buildSyntaxTree, flattenSyntaxTree } from './syntaxTree.js'
import { computeSyntaxTreeAttributes } from './syntaxTreeAttributes.js'

export function buildRegexDirectMethod(input) {
  const validation = validateRegex(input)
  if (!validation.ok) {
    return { ok: false, validation }
  }

  const explicit = insertExplicitConcatenation(validation.tokens)
  const augmentedTokens = augmentRegex(explicit.tokens)
  const postfixResult = infixToPostfix(augmentedTokens)
  const tree = buildSyntaxTree(postfixResult.postfix)
  computeSyntaxTreeAttributes(tree.root)
  const follow = computeFollowpos(tree.root, tree.positionToSymbol)
  const dfa = constructDirectDfa({
    root: tree.root,
    followpos: follow.followpos,
    positionToSymbol: tree.positionToSymbol,
    hashPosition: tree.hashPosition,
  })

  return {
    ok: true,
    validation,
    explicitTokens: explicit.tokens,
    concatSteps: explicit.steps,
    augmentedTokens,
    postfix: postfixResult.postfix,
    postfixSteps: postfixResult.steps,
    tree: tree.root,
    treeNodes: flattenSyntaxTree(tree.root),
    positionToSymbol: tree.positionToSymbol,
    symbolToPositions: tree.symbolToPositions,
    hashPosition: tree.hashPosition,
    followpos: follow.followpos,
    followSteps: follow.steps,
    dfa,
  }
}
