import { foreground } from "../formatters/ansi.js";

// Dividers use enough width to read as a section break in compact output.
const defaultWidth = 40;

// Hyphen keeps the divider stable in plain and ASCII-only terminals.
const defaultCharacter = "-";

// Divider colour should expose the border token in diagnostic output.
const defaultColour = "border";

/**
 * Render a horizontal divider.
 *
 * @param  {object}  options
 *     Rendering options.
 * @param  {string}  options.character
 *     Character to repeat.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @param  {string}  options.dividerColour
 *     Colour token for the divider.
 * @param  {number}  options.dividerWidth
 *     Divider width.
 * @param  {string}  options.label
 *     Optional label to render before the divider line.
 * @param  {string}  options.labelColour
 *     Colour token for the label.
 * @returns  {string}
 *     Rendered divider.
 */
export function divider(options = {}) {
	const character = options.character ?? defaultCharacter;
	const label = options.label ?? "";
	const width = options.dividerWidth ?? defaultWidth;
	const lineWidth = Math.max(width - label.length - labelGap(label), 0);
	const line = character.repeat(lineWidth);
	const output = label === "" ? line : `${label} ${line}`;

	if (options.colour !== true) {
		return output;
	}

	if (label === "") {
		return foreground(line, options.dividerColour ?? defaultColour, options);
	}

	const renderedLabel = foreground(label, options.labelColour ?? "info", options);
	const renderedLine = foreground(line, options.dividerColour ?? defaultColour, options);

	return `${renderedLabel} ${renderedLine}`;
}

/**
 * Return the label spacing used inside the requested divider width.
 *
 * @param  {string}  label
 *     Divider label.
 * @returns  {number}
 *     Width reserved for label gap.
 */
function labelGap(label) {
	return label === "" ? 0 : 1;
}
