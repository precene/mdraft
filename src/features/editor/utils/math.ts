const CODE_FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})/;
const BARE_MATH_FENCE = /^ {0,3}\$\$+\s*$/;
const MATH_FENCE_WITH_EXPRESSION = /^( {0,3})\$\$(?!\$)(.*)$/;

function isClosingCodeFence(line: string, openingFence: string) {
  const match = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(line);
  return (
    match !== null &&
    match[1][0] === openingFence[0] &&
    match[1].length >= openingFence.length
  );
}

/**
 * Rewrites a single-line `$$ expression` with no closing fence into a closed
 * display-math block.
 *
 * remark-math treats `$$ expression` as an opening fence. If it is never
 * closed, everything after it is swallowed as math up to the end of the
 * document. VS Code renders the line as display math on its own, and this
 * function reproduces that. A `$$ meta` line that is closed later by a bare
 * `$$` keeps the remark-math meaning.
 *
 * Only top-level lines are handled (not blockquotes or list items), and
 * fenced code blocks are skipped.
 */
export function closeUnterminatedDisplayMath(markdown: string) {
  if (!markdown.includes("$$")) {
    return markdown;
  }

  const lines = markdown.split("\n");

  // hasBareFenceFrom[i] is true when a bare `$$` line exists at index >= i.
  // Precomputed so the whole pass stays O(n).
  const hasBareFenceFrom = new Array<boolean>(lines.length + 1).fill(false);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    hasBareFenceFrom[index] =
      hasBareFenceFrom[index + 1] || BARE_MATH_FENCE.test(lines[index]);
  }

  let openCodeFence: string | null = null;
  let insideMath = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (openCodeFence) {
      if (isClosingCodeFence(line, openCodeFence)) {
        openCodeFence = null;
      }
      continue;
    }

    if (insideMath) {
      if (BARE_MATH_FENCE.test(line)) {
        insideMath = false;
      }
      continue;
    }

    const codeFence = CODE_FENCE_OPEN.exec(line);
    if (codeFence) {
      openCodeFence = codeFence[1];
      continue;
    }

    if (BARE_MATH_FENCE.test(line)) {
      insideMath = true;
      continue;
    }

    const mathFence = MATH_FENCE_WITH_EXPRESSION.exec(line);
    if (!mathFence) {
      continue;
    }

    const [, indent, rest] = mathFence;
    const expression = rest.trim();

    // Empty, or `$$ ... $$` on one line (handled as inline display math).
    if (!expression || expression.includes("$$")) {
      continue;
    }

    if (hasBareFenceFrom[index + 1]) {
      insideMath = true;
      continue;
    }

    lines[index] = `${indent}$$\n${indent}${expression}\n${indent}$$`;
  }

  return lines.join("\n");
}
