import { background, foreground, stripAnsi } from "../formatters/ansi.js";
import { profiles } from "../profiles/profiles.js";
import { diffColours } from "../theme/colours.js";
import { isNonEmptyString, isRecord, renderTitle } from "./helpers.js";

// Diff line types map stable prefixes and semantic tones for text profiles.
const diffLineTypes = {
	added: {
		prefix: "+ ",
		tone: "success",
	},
	context: {
		prefix: "  ",
		tone: "muted",
	},
	header: {
		prefix: "@@ ",
		tone: "info",
	},
	removed: {
		prefix: "- ",
		tone: "danger",
	},
};

// Full-row fills apply only to colour-enabled terminal text profiles.
const backgroundProfiles = new Set([profiles.DIAGNOSTIC, profiles.HUMAN]);

/**
 * Render a structured diff block for human and agent output.
 *
 * @param  {object}  diff
 *     Structured diff input.
 * @param  {object[]}  diff.lines
 *     Structured diff lines.
 * @param  {number}  diff.lines[].oldLineNumber
 *     Optional caller-supplied old line number.
 * @param  {number}  diff.lines[].newLineNumber
 *     Optional caller-supplied new line number.
 * @param  {string}  diff.path
 *     Optional affected path.
 * @param  {string}  diff.title
 *     Optional block title.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {object|string}
 *     Structured JSON input or rendered diff block.
 */
export function diffBlock(diff, options = {}) {
	if (options.profile === profiles.JSON) {
		return diff;
	}

	if (!isRecord(diff)) {
		return "";
	}

	const lines = normaliseLines(diff.lines);

	if (lines.length === 0) {
		return "";
	}

	const gutterWidth = getGutterWidth(lines);
	const renderedLines = lines.map((line) => renderLine(line, options, gutterWidth));
	const summary = gutterWidth === undefined ? "" : renderChangeSummary(lines, options);
	const metadata = renderMetadata(diff, options, summary);

	if (options.profile === profiles.AGENT) {
		const codeFence = ["```diff", renderedLines.join("\n"), "```"].join("\n");

		return [...metadata, codeFence].join("\n\n");
	}

	return [...metadata, renderedLines.join("\n")].filter((section) => section !== "").join("\n\n");
}

/**
 * Return structured lines with supported types and text.
 *
 * @param  {*}  lines
 *     Candidate diff lines.
 * @returns  {object[]}
 *     Valid diff lines.
 */
function normaliseLines(lines) {
	if (!Array.isArray(lines)) {
		return [];
	}

	return lines.filter(isValidLine).map((line) => ({
		newLineNumber: normaliseLineNumber(line.newLineNumber),
		oldLineNumber: normaliseLineNumber(line.oldLineNumber),
		text: stripAnsi(line.text),
		type: line.type,
	}));
}

/**
 * Return a valid positive line number or undefined.
 *
 * @param  {*}  value
 *     Candidate line number.
 * @returns  {number|undefined}
 *     Normalised line number.
 */
function normaliseLineNumber(value) {
	return Number.isInteger(value) && value > 0 ? value : undefined;
}

/**
 * Return the stable gutter width for a fully numbered block.
 *
 * @param  {object[]}  lines
 *     Normalised diff lines.
 * @returns  {number|undefined}
 *     Widest line-number width, or undefined when gutters are unavailable.
 */
function getGutterWidth(lines) {
	const codeLines = lines.filter((line) => line.type !== "header");

	if (codeLines.length === 0 || !codeLines.every(hasRequiredLineNumbers)) {
		return undefined;
	}

	return Math.max(
		...codeLines
			.flatMap(getVisibleLineNumbers)
			.filter((lineNumber) => lineNumber !== undefined)
			.map((lineNumber) => String(lineNumber).length),
	);
}

/**
 * Return line numbers visible for one diff type.
 *
 * @param  {object}  line
 *     Normalised diff line.
 * @returns  {number[]}
 *     Visible old and new line numbers.
 */
function getVisibleLineNumbers(line) {
	if (line.type === "added") {
		return [line.newLineNumber];
	}

	if (line.type === "removed") {
		return [line.oldLineNumber];
	}

	return [line.oldLineNumber, line.newLineNumber];
}

/**
 * Check whether a line has the numbers required by its diff type.
 *
 * @param  {object}  line
 *     Normalised diff line.
 * @returns  {boolean}
 *     Whether the line can participate in a numbered gutter.
 */
function hasRequiredLineNumbers(line) {
	if (line.type === "added") {
		return line.newLineNumber !== undefined;
	}

	if (line.type === "removed") {
		return line.oldLineNumber !== undefined;
	}

	return line.oldLineNumber !== undefined && line.newLineNumber !== undefined;
}

/**
 * Check whether a candidate is a supported diff line.
 *
 * @param  {*}  line
 *     Candidate diff line.
 * @returns  {boolean}
 *     Whether the line can be rendered safely.
 */
function isValidLine(line) {
	return isRecord(line) && Object.hasOwn(diffLineTypes, line.type) && typeof line.text === "string";
}

/**
 * Render optional diff metadata for the active profile.
 *
 * @param  {object}  diff
 *     Structured diff input.
 * @param  {object}  options
 *     Rendering options.
 * @param  {string}  summary
 *     Optional added and removed line count.
 * @returns  {string[]}
 *     Rendered metadata sections.
 */
function renderMetadata(diff, options, summary) {
	const metadata = [];

	if (isNonEmptyString(diff.title)) {
		const title = stripAnsi(diff.title);

		metadata.push(renderTitle(formatMetadataValue(title, summary), options));
	}

	if (isNonEmptyString(diff.path)) {
		const path = stripAnsi(diff.path);

		metadata.push(`Path: ${formatMetadataValue(path, summary, diff.title)}`);
	} else if (!isNonEmptyString(diff.title) && summary !== "") {
		metadata.push(summary);
	}

	return metadata;
}

/**
 * Append a change summary to the first available metadata value.
 *
 * @param  {string}  value
 *     Metadata value.
 * @param  {string}  summary
 *     Optional change summary.
 * @param  {*}  title
 *     Title value used to avoid duplicating a summary on the path.
 * @returns  {string}
 *     Metadata value with optional summary.
 */
function formatMetadataValue(value, summary, title) {
	return summary !== "" && !isNonEmptyString(title) ? `${value} ${summary}` : value;
}

/**
 * Count added and removed lines already present in the block.
 *
 * @param  {object[]}  lines
 *     Normalised diff lines.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Optional change summary.
 */
function renderChangeSummary(lines, options) {
	const added = lines.filter((line) => line.type === "added").length;
	const removed = lines.filter((line) => line.type === "removed").length;

	if (added === 0 && removed === 0) {
		return "";
	}

	const profile = options.profile ?? profiles.HUMAN;
	const addedValue = `+${added}`;
	const removedValue = `-${removed}`;

	if (options.colour !== true || !backgroundProfiles.has(profile)) {
		return `(${addedValue} ${removedValue})`;
	}

	return `(${foreground(addedValue, "success", options)} ${foreground(removedValue, "danger", options)})`;
}

/**
 * Render one diff line with a stable semantic prefix.
 *
 * @param  {object}  line
 *     Normalised diff line.
 * @param  {object}  options
 *     Rendering options.
 * @param  {number|undefined}  gutterWidth
 *     Stable gutter width for the block.
 * @returns  {string}
 *     Rendered diff line.
 */
function renderLine(line, options, gutterWidth) {
	const lineType = diffLineTypes[line.type];
	const gutter = gutterWidth === undefined ? "" : renderGutter(line, gutterWidth);
	const lineValue = `${gutter}${lineType.prefix}${line.text}`;
	const profile = options.profile ?? profiles.HUMAN;
	const fill = diffColours[line.type];

	if (options.colour === true && backgroundProfiles.has(profile) && fill !== undefined) {
		return background(foreground(lineValue, fill.foreground, options), fill.background, options);
	}

	const prefix = foreground(lineType.prefix, lineType.tone, options);

	return `${gutter}${prefix}${line.text}`;
}

/**
 * Render one stable old/new line-number gutter.
 *
 * @param  {object}  line
 *     Normalised diff line.
 * @param  {number}  width
 *     Widest line-number width in the block.
 * @returns  {string}
 *     Rendered gutter.
 */
function renderGutter(line, width) {
	const blank = " ".repeat(width);
	const oldNumber = formatLineNumber(line.oldLineNumber, width);
	const newNumber = formatLineNumber(line.newLineNumber, width);

	if (line.type === "added") {
		return `${blank} ${newNumber} `;
	}

	if (line.type === "removed") {
		return `${oldNumber} ${blank} `;
	}

	if (line.type === "context" && line.oldLineNumber === line.newLineNumber) {
		return `${oldNumber} ${blank} `;
	}

	return `${oldNumber} ${newNumber} `;
}

/**
 * Pad one line number to the block gutter width.
 *
 * @param  {number|undefined}  value
 *     Line number to format.
 * @param  {number}  width
 *     Gutter width.
 * @returns  {string}
 *     Right-aligned number or blank placeholder.
 */
function formatLineNumber(value, width) {
	return value === undefined ? " ".repeat(width) : String(value).padStart(width, " ");
}
