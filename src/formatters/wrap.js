// Width used when a caller doesn't provide one.
const defaultWrapWidth = 64;
const escapeCharacter = String.fromCharCode(27);
const bellCharacter = String.fromCharCode(7);

// Matches ANSI CSI and OSC escape sequences so they can be measured as zero-width.
const ansiEscapePattern = new RegExp(
	`${escapeCharacter}(?:\\[[0-?]*[ -/]*[@-~]|\\][^${bellCharacter}]*(?:${bellCharacter}|${escapeCharacter}\\\\))`,
	"gu",
);

/**
 * Wrap text to a maximum visible width, treating ANSI escape sequences as zero-width.
 *
 * @param  {string}  text
 *     Text to wrap.
 * @param  {number}  width
 *     Maximum visible width per line.
 * @returns  {string[]}
 *     Wrapped lines.
 */
export function wrapText(text, width = defaultWrapWidth) {
	const wrapWidth = resolveWrapWidth(width);
	const tokens = tokenise(String(text));
	const lines = [];

	let line = [];

	for (const token of tokens) {
		if (token.value === "\n") {
			lines.push(renderTokens(line));
			line = [];
			continue;
		}

		line.push(token);

		while (visibleWidth(line) > wrapWidth) {
			const whitespaceIndex = findLastWhitespace(line);

			if (whitespaceIndex > 0) {
				const left = line.slice(0, whitespaceIndex);

				lines.push(renderTokens(left));
				line = trimLeadingWhitespace(line.slice(whitespaceIndex + 1));
				continue;
			}

			const splitIndex = findHardSplitIndex(line, wrapWidth);

			lines.push(renderTokens(line.slice(0, splitIndex)));
			line = line.slice(splitIndex);
		}
	}

	lines.push(renderTokens(line));

	return lines;
}

/**
 * Resolve a usable wrap width, falling back to the default for invalid input.
 *
 * @param  {number}  width
 *     Requested wrap width.
 * @returns  {number}
 *     Whole-number wrap width of at least 1.
 */
function resolveWrapWidth(width) {
	const numericWidth = Number(width);

	if (!Number.isFinite(numericWidth) || numericWidth < 1) {
		return defaultWrapWidth;
	}

	return Math.floor(numericWidth);
}

/**
 * Split text into visible characters and ANSI escape sequences.
 *
 * @param  {string}  text
 *     Text to tokenise.
 * @returns  {object[]}
 *     Tokens, each with a `value` and its `visibleWidth`.
 */
function tokenise(text) {
	const tokens = [];

	let textStart = 0;

	for (const match of text.matchAll(ansiEscapePattern)) {
		appendTextTokens(tokens, text.slice(textStart, match.index));
		tokens.push({
			value: match[0],
			visibleWidth: 0,
		});
		textStart = match.index + match[0].length;
	}

	appendTextTokens(tokens, text.slice(textStart));

	return tokens;
}

/**
 * Append one token per character of plain text to a token list.
 *
 * @param  {object[]}  tokens
 *     Token list to append to.
 * @param  {string}  text
 *     Plain text, with no ANSI escape sequences.
 * @returns  {void}
 */
function appendTextTokens(tokens, text) {
	for (const value of text) {
		tokens.push({
			value,
			visibleWidth: value === "\n" ? 0 : 1,
		});
	}
}

/**
 * Sum the visible width of a list of tokens.
 *
 * @param  {object[]}  tokens
 *     Tokens to measure.
 * @returns  {number}
 *     Total visible width.
 */
function visibleWidth(tokens) {
	return tokens.reduce((width, token) => width + token.visibleWidth, 0);
}

/**
 * Find the index of the last whitespace token, to break a line at a word boundary.
 *
 * @param  {object[]}  tokens
 *     Tokens to search.
 * @returns  {number}
 *     Index of the last whitespace token, or -1 when none is found.
 */
function findLastWhitespace(tokens) {
	for (let index = tokens.length - 1; index >= 0; index -= 1) {
		const token = tokens[index];

		if (token.visibleWidth === 1 && /\s/u.test(token.value)) {
			return index;
		}
	}

	return -1;
}

/**
 * Find the index to split at when a line has no whitespace to break on.
 *
 * @param  {object[]}  tokens
 *     Tokens to search.
 * @param  {number}  width
 *     Maximum visible width for the first segment.
 * @returns  {number}
 *     Index at which to split the tokens.
 */
function findHardSplitIndex(tokens, width) {
	let currentWidth = 0;

	for (let index = 0; index < tokens.length; index += 1) {
		currentWidth += tokens[index].visibleWidth;

		if (currentWidth >= width) {
			return index + 1;
		}
	}

	return tokens.length;
}

/**
 * Remove leading whitespace tokens from a wrapped continuation line.
 *
 * @param  {object[]}  tokens
 *     Tokens to trim.
 * @returns  {object[]}
 *     Tokens with leading whitespace removed.
 */
function trimLeadingWhitespace(tokens) {
	const trimmedTokens = [];

	let hasVisibleText = false;

	for (const token of tokens) {
		if (token.visibleWidth === 0) {
			trimmedTokens.push(token);
			continue;
		}

		if (!hasVisibleText && /\s/u.test(token.value)) {
			continue;
		}

		hasVisibleText = true;
		trimmedTokens.push(token);
	}

	return trimmedTokens;
}

/**
 * Join a list of tokens back into a string.
 *
 * @param  {object[]}  tokens
 *     Tokens to render.
 * @returns  {string}
 *     Rendered text.
 */
function renderTokens(tokens) {
	return tokens.map((token) => token.value).join("");
}
