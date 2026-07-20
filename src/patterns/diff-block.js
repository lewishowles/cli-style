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

	const renderedLines = lines.map((line) => renderLine(line, options));
	const metadata = renderMetadata(diff, options);

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
		text: stripAnsi(line.text),
		type: line.type,
	}));
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
 * @returns  {string[]}
 *     Rendered metadata sections.
 */
function renderMetadata(diff, options) {
	const metadata = [];

	if (isNonEmptyString(diff.title)) {
		metadata.push(renderTitle(stripAnsi(diff.title), options));
	}

	if (isNonEmptyString(diff.path)) {
		metadata.push(`Path: ${stripAnsi(diff.path)}`);
	}

	return metadata;
}

/**
 * Render one diff line with a stable semantic prefix.
 *
 * @param  {object}  line
 *     Normalised diff line.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered diff line.
 */
function renderLine(line, options) {
	const lineType = diffLineTypes[line.type];
	const lineValue = `${lineType.prefix}${line.text}`;
	const profile = options.profile ?? profiles.HUMAN;
	const fill = diffColours[line.type];

	if (options.colour === true && backgroundProfiles.has(profile) && fill !== undefined) {
		return background(foreground(lineValue, fill.foreground, options), fill.background, options);
	}

	const prefix = foreground(lineType.prefix, lineType.tone, options);

	return `${prefix}${line.text}`;
}
