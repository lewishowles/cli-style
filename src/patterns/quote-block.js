import { foreground, stripAnsi } from "../formatters/ansi.js";
import { wrapText } from "../formatters/wrap.js";
import { profiles } from "../profiles/profiles.js";
import { isNonEmptyString, isRecord, renderSection } from "./helpers.js";

// The total width, including the marker and its space, used when no width is given.
const defaultWidth = 66;

/**
 * Render another program's output with a marker beside each line, under an optional heading.
 *
 * @param  {object}  quote
 *     Quoted output to show.
 * @param  {string[]}  quote.lines
 *     Output lines, including any blank lines to preserve.
 * @param  {string}  quote.title
 *     Optional heading above the output.
 * @param  {number}  quote.width
 *     Optional total width, including the marker and its space.
 * @param  {object}  options
 *     Rendering options, such as the profile, Unicode support, and a fallback width.
 * @returns  {object|string}
 *     The quote unchanged for the json profile. Otherwise the marked lines as one string,
 *     or an empty string when there are no lines to show.
 */
export function quoteBlock(quote, options = {}) {
	if (options.profile === profiles.JSON) {
		return quote;
	}

	if (!isRecord(quote) || !Array.isArray(quote.lines)) {
		return "";
	}

	// Lines that are not strings are skipped so one bad entry does not hide the rest.
	const lines = quote.lines.filter((line) => typeof line === "string");

	if (lines.length === 0) {
		return "";
	}

	// The width from the quote wins over the options, and an invalid width falls back to the default.
	const requestedWidth = quote.width ?? options.width ?? defaultWidth;

	const width =
		Number.isInteger(requestedWidth) && requestedWidth > 0 ? requestedWidth : defaultWidth;

	// The room left for text once the marker and its space are drawn.
	const contentWidth = Math.max(width - 2, 1);

	// Plain and CI output are written for logs and searches, so they get no colour and the ASCII marker.
	const isPlainOutput = options.profile === profiles.CI || options.profile === profiles.PLAIN;

	// The ASCII marker is also used whenever Unicode is off.
	const marker = options.unicode === false || isPlainOutput ? "|" : "│";

	// The marker is muted wherever colour is allowed.
	const renderedMarker = isPlainOutput ? marker : foreground(marker, "muted", options);

	// Each wrapped part gets its own marker, so continuation lines stay visibly quoted.
	const renderedLines = lines.flatMap((line) =>
		wrapText(stripAnsi(line), contentWidth).map((part) => `${renderedMarker} ${part}`),
	);

	if (!isNonEmptyString(quote.title)) {
		return renderedLines.join("\n");
	}

	return renderSection(stripAnsi(quote.title), renderedLines, options, false);
}
