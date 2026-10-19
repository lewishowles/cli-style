import { eastAsianWidth } from "get-east-asian-width";

import { resolveColourValue } from "../theme/colours.js";

// ANSI reset sequence used after coloured output.
const reset = "\u001b[0m";

// The escape character that starts every ANSI sequence.
const escapeCharacter = String.fromCharCode(27);

// The bell character that can end an OSC sequence, such as a terminal hyperlink.
const bellCharacter = String.fromCharCode(7);

// Matches ANSI CSI sequences, such as colours, and OSC sequences, such as hyperlinks, which take up no columns on screen.
const ansiPattern = new RegExp(
	`${escapeCharacter}(?:\\[[0-?]*[ -/]*[@-~]|\\][^${bellCharacter}${escapeCharacter}]*(?:${bellCharacter}|${escapeCharacter}\\\\))`,
	"gu",
);

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
