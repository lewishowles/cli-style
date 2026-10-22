import { eastAsianWidth } from "get-east-asian-width";

import { resolveColourValue } from "../theme/colours.js";

// ANSI reset sequence used after coloured output.
const reset = "\u001b[0m";

// The escape character that starts every ANSI sequence.
const escapeCharacter = String.fromCharCode(27);

// The bell character that can end an OSC sequence, such as a terminal hyperlink.
const bellCharacter = String.fromCharCode(7);

// Matches ANSI CSI sequences, such as colours, and OSC sequences, such as hyperlinks, which take up no columns on screen.
export const ansiPattern = new RegExp(
	`${escapeCharacter}(?:\\[[0-?]*[ -/]*[@-~]|\\][^${bellCharacter}${escapeCharacter}]*(?:${bellCharacter}|${escapeCharacter}\\\\))`,
	"gu",
);

// Matches the same sequences as a captured group, so splitting text on it keeps each sequence as its own piece.
const ansiSplitPattern = new RegExp(`(${ansiPattern.source})`, "u");

// The number of columns between tab stops when tabs are turned into spaces.
const tabWidth = 4;

// Matches a terminal link sequence and captures its address, which is empty when the sequence ends a link.
const hyperlinkPattern = new RegExp(
	`^${escapeCharacter}\\]8;[^;]*;([^${bellCharacter}${escapeCharacter}]*)`,
	"u",
);

// The sequences that clear every colour and text style at once.
const clearStyleCodes = [reset, "\u001b[m"];

// The sequence that switches the text colour back to the terminal default.
const foregroundClose = "\u001b[39m";

// The sequence that switches the background colour back to the terminal default.
const backgroundClose = "\u001b[49m";

// The sequence that switches off both bold and dim text.
const weightClose = "\u001b[22m";

// Matches a full reset or a sequence that switches off only the text colour, background or bold and dim.
const closingStylePattern = new RegExp(`${escapeCharacter}\\[(?:0|22|39|49)?m`, "gu");

// Splits text into the characters people see, so a joined emoji or an accented letter counts as one.
const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

// Matches emoji presentation characters or the selector that requests emoji presentation.
const emojiPattern = /[\p{Emoji_Presentation}\uFE0F]/u;

// Matches a cluster made only of combining marks or invisible characters, such as a lone joiner, which take no columns.
const zeroWidthPattern = /^[\p{Mark}\p{Default_Ignorable_Code_Point}]+$/u;

// ANSI style sequences supported before primitive renderers exist.
const styleCodes = {
	bold: "\u001b[1m",
	dim: "\u001b[2m",
};

/**
 * Wrap text in a foreground colour when colour output is enabled.
 *
 * @param  {string}  value
 *     Text to wrap.
 * @param  {string}  colour
 *     Colour token name or hex colour.
 * @param  {object}  options
 *     Formatting options.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @returns  {string}
 *     Coloured text, or the original text when colour is disabled.
 */
export function foreground(value, colour, options = {}) {
	return wrapColour(value, colour, options, createForegroundCode);
}

/**
 * Wrap text in a background colour when colour output is enabled.
 *
 * @param  {string}  value
 *     Text to wrap.
 * @param  {string}  colour
 *     Colour token name or hex colour.
 * @param  {object}  options
 *     Formatting options.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @returns  {string}
 *     Coloured text, or the original text when colour is disabled.
 */
export function background(value, colour, options = {}) {
	return wrapColour(value, colour, options, createBackgroundCode);
}

/**
 * Wrap text in a basic ANSI style when colour output is enabled.
 *
 * @param  {string}  value
 *     Text to wrap.
 * @param  {string}  style
 *     Style name to apply.
 * @param  {object}  options
 *     Formatting options.
 * @param  {boolean}  options.colour
 *     Whether ANSI style should be applied.
 * @returns  {string}
 *     Styled text, or the original text when styling is disabled.
 */
export function style(value, style, options = {}) {
	const styleCode = styleCodes[style];

	if (options.colour !== true || styleCode === undefined) {
		return value;
	}

	return `${styleCode}${value}${reset}`;
}

/**
 * Switch the given styles back on wherever coloured text inside switches them off, so an
 * outer style carries on past text coloured by this package, chalk, picocolors or
 * `util.styleText`. After a full reset, written as `\u001b[0m` or `\u001b[m`, every given
 * style comes back on. After a sequence that ends only the text colour, the background,
 * or bold and dim, only the given styles of that kind come back on, so other colours the
 * inner text left on stay on.
 *
 * @param  {string}  value
 *     Text that may hold coloured parts.
 * @param  {string[]}  stylesToRestore
 *     The styles to switch back on, each rendered on an empty string, such as
 *     `style("", "bold", options)`. An empty entry adds nothing.
 * @returns  {string}
 *     The text with each switched-off style turned back on.
 */
export function restoreStyles(value, stylesToRestore) {
	// The codes that turn each style on, with its closing reset cut off.
	const openingCodes = stylesToRestore.map((styleToRestore) =>
		styleToRestore.slice(0, -reset.length),
	);

	// Every style, switched back on together after a full reset.
	const allOpeningCodes = openingCodes.join("");

	// The text colour styles, switched back on after a text colour close.
	let foregroundCodes = "";
	// The background styles, switched back on after a background close.
	let backgroundCodes = "";
	// The bold and dim styles, switched back on after a bold and dim close.
	let weightCodes = "";

	// Sorts each style by the number at the start of its code. The text colour and
	// background ranges include 39 and 49 because the default colour opens with them.
	for (const openingCode of openingCodes) {
		// The first number after the escape and bracket, such as 31 for red text.
		const styleNumber = Number.parseInt(openingCode.slice(2), 10);

		if ((styleNumber >= 30 && styleNumber <= 39) || (styleNumber >= 90 && styleNumber <= 97)) {
			foregroundCodes += openingCode;
		} else if (
			(styleNumber >= 40 && styleNumber <= 49) ||
			(styleNumber >= 100 && styleNumber <= 107)
		) {
			backgroundCodes += openingCode;
		} else if (styleNumber === 1 || styleNumber === 2) {
			weightCodes += openingCode;
		}
	}

	return value.replace(closingStylePattern, (closingCode) => {
		if (closingCode === foregroundClose) {
			return `${closingCode}${foregroundCodes}`;
		}

		if (closingCode === backgroundClose) {
			return `${closingCode}${backgroundCodes}`;
		}

		if (closingCode === weightClose) {
			return `${closingCode}${weightCodes}`;
		}

		return `${closingCode}${allOpeningCodes}`;
	});
}

/**
 * Remove ANSI escape sequences from text.
 *
 * @param  {string}  value
 *     Text to clean.
 * @returns  {string}
 *     Text without ANSI escape sequences.
 */
export function stripAnsi(value) {
	return value.replace(ansiPattern, "");
}

/**
 * Replace each tab with spaces up to the next four-column stop, so renderers
 * measure and pad the text as the terminal draws it. Stops count from the
 * start of each line, and colour codes and links take no columns.
 *
 * @param  {string}  value
 *     The text to expand, which may contain ANSI sequences.
 * @returns  {string}
 *     The text with no tabs left in it.
 */
export function expandTabs(value) {
	if (!value.includes("\t")) {
		return value;
	}

	// The column the next character lands on. It carries across colour codes and
	// links, which take no columns, and goes back to 0 at each line break.
	let column = 0;

	return value
		.split(ansiSplitPattern)
		.map((part, index) => {
			if (index % 2 === 1) {
				return part;
			}

			let expanded = "";

			for (const { segment } of graphemeSegmenter.segment(part)) {
				if (segment === "\t") {
					const spaces = tabWidth - (column % tabWidth);

					expanded += " ".repeat(spaces);
					column += spaces;
				} else {
					expanded += segment;
					column = segment === "\n" || segment === "\r\n" ? 0 : column + visibleWidth(segment);
				}
			}

			return expanded;
		})
		.join("");
}

/**
 * Count the terminal columns that text fills on screen. ANSI sequences take no
 * columns, and East Asian wide characters and emoji take two.
 *
 * @param  {string}  value
 *     The text to measure, which may contain ANSI sequences.
 * @returns  {number}
 *     The number of columns the text fills.
 */
export function visibleWidth(value) {
	let width = 0;

	for (const { segment } of graphemeSegmenter.segment(stripAnsi(value))) {
		if (zeroWidthPattern.test(segment)) {
			continue;
		}

		if (eastAsianWidth(segment.codePointAt(0)) === 2 || emojiPattern.test(segment)) {
			width += 2;
			continue;
		}

		width += 1;
	}

	return width;
}

/**
 * Add trailing spaces until text fills a number of terminal columns. Colour
 * codes take no space and wide characters take two, so coloured and wide text
 * pads to the same width as plain text.
 *
 * @param  {string}  value
 *     The text to pad, which may contain ANSI colour codes.
 * @param  {number}  width
 *     The number of columns the text should fill.
 * @returns  {string}
 *     The padded text, or the text unchanged when it already fills the width.
 */
export function padVisible(value, width) {
	return value + " ".repeat(Math.max(0, width - visibleWidth(value)));
}

/**
 * Split text at a terminal column without breaking a colour code, a link or a
 * character. A character that would cross the column, such as a two-column 界
 * at the edge, starts the remaining text instead.
 *
 * When the cut falls inside coloured or linked text, the first piece ends by
 * closing the colour and the link, and the remaining text starts by reopening
 * them, so each piece can be printed on a line of its own.
 *
 * @param  {string}  value
 *     The text to split, which may contain ANSI colour codes and terminal links.
 * @param  {number}  width
 *     The most columns the first piece may fill.
 * @returns  {{ head: string, tail: string }}
 *     The first piece and the remaining text, which is empty when the whole
 *     value fits.
 */
export function sliceVisible(value, width) {
	// Splitting on a captured pattern puts plain text at even indexes and ANSI sequences at odd ones.
	const parts = value.split(ansiSplitPattern);

	// The link open at the current position, with the sequences that close and reopen it.
	let activeLink = null;
	// The colour and style codes in effect at the current position, in the order they were set.
	let activeStyles = [];
	// The columns filled so far.
	let columns = 0;
	// The position in the original value reached so far.
	let cursor = 0;

	for (const [index, part] of parts.entries()) {
		if (index % 2 === 0) {
			for (const { segment } of graphemeSegmenter.segment(part)) {
				const segmentWidth = visibleWidth(segment);

				if (columns + segmentWidth > width) {
					const head =
						value.slice(0, cursor) +
						(activeLink?.closer ?? "") +
						(activeStyles.length > 0 ? reset : "");

					const tail = activeStyles.join("") + (activeLink?.opener ?? "") + value.slice(cursor);

					return { head, tail };
				}

				columns += segmentWidth;
				cursor += segment.length;
			}

			continue;
		}

		if (clearStyleCodes.includes(part)) {
			activeStyles = [];
		} else if (part.startsWith(`${escapeCharacter}[`) && part.endsWith("m")) {
			activeStyles.push(part);
		}

		const hyperlink = part.match(hyperlinkPattern);

		if (hyperlink !== null) {
			// The closing sequence ends the same way as the opening one, with a bell or an escape and backslash.
			const terminator = part.endsWith(bellCharacter) ? bellCharacter : `${escapeCharacter}\\`;

			activeLink =
				hyperlink[1] === ""
					? null
					: {
							closer: `${escapeCharacter}]8;;${terminator}`,
							opener: part,
						};
		}

		cursor += part.length;
	}

	return { head: value, tail: "" };
}

/**
 * Wrap text in ANSI colour codes.
 *
 * @param  {string}  value
 *     Text to wrap.
 * @param  {string}  colour
 *     Colour token name or hex colour.
 * @param  {object}  options
 *     Formatting options.
 * @param  {Function}  createCode
 *     Function that creates the ANSI opening sequence.
 * @returns  {string}
 *     Coloured text, or the original text when colour is disabled.
 */
function wrapColour(value, colour, options, createCode) {
	const resolvedColour = resolveColourValue(colour, options);

	if (options.colour !== true || resolvedColour === null) {
		return value;
	}

	return `${createCode(resolvedColour)}${value}${reset}`;
}

/**
 * Create a foreground ANSI sequence from a hex colour.
 *
 * @param  {string}  colour
 *     Hex colour value.
 * @returns  {string}
 *     ANSI foreground sequence.
 */
function createForegroundCode(colour) {
	if (colour === "default-foreground") {
		return "\u001b[39m";
	}

	if (colour.startsWith("ansi-256:")) {
		return `\u001b[38;5;${colour.slice("ansi-256:".length)}m`;
	}

	const { blue, green, red } = parseHexColour(colour);

	return `\u001b[38;2;${red};${green};${blue}m`;
}

/**
 * Create a background ANSI sequence from a hex colour.
 *
 * @param  {string}  colour
 *     Hex colour value.
 * @returns  {string}
 *     ANSI background sequence.
 */
function createBackgroundCode(colour) {
	if (colour === "default-background") {
		return "\u001b[49m";
	}

	if (colour.startsWith("ansi-256:")) {
		return `\u001b[48;5;${colour.slice("ansi-256:".length)}m`;
	}

	const { blue, green, red } = parseHexColour(colour);

	return `\u001b[48;2;${red};${green};${blue}m`;
}

/**
 * Parse a hex colour into RGB values.
 *
 * @param  {string}  colour
 *     Hex colour value.
 * @returns  {object}
 *     Red, green, and blue values.
 */
function parseHexColour(colour) {
	return {
		blue: Number.parseInt(colour.slice(5, 7), 16),
		green: Number.parseInt(colour.slice(3, 5), 16),
		red: Number.parseInt(colour.slice(1, 3), 16),
	};
}
