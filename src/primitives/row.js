import { foreground } from "../formatters/ansi.js";

// Row labels use the same subdued tone as table headers by default.
const defaultLabelColour = "muted";

// Rows use a compact gap that still reads cleanly in plain terminals.
const defaultSeparator = "  ";

/**
 * Render a labelled value row.
 *
 * @param  {string}  label
 *     Label text to render.
 * @param  {string}  value
 *     Value text to render.
 * @param  {object}  options
 *     Rendering options.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @param  {string}  options.labelColour
 *     Colour token for the label.
 * @param  {number}  options.labelWidth
 *     Minimum label width before the separator.
 * @param  {string}  options.separator
 *     Text between label and value.
 * @param  {string}  options.valueColour
 *     Optional colour token for the value.
 * @returns  {string}
 *     Rendered row.
 */
export function row(label, value = "", options = {}) {
	const labelWidth = Math.max(label.length, options.labelWidth ?? 0);
	const labelText = label.padEnd(labelWidth, " ");
	const renderedLabel = renderLabel(labelText, options);

	if (value === "") {
		return renderedLabel;
	}

	const renderedValue = renderValue(value, options);
	const separator = options.separator ?? defaultSeparator;

	return `${renderedLabel}${separator}${renderedValue}`;
}

/**
 * Render a row label.
 *
 * @param  {string}  label
 *     Label text to render.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered label.
 */
function renderLabel(label, options) {
	if (options.colour !== true) {
		return label;
	}

	return foreground(label, options.labelColour ?? defaultLabelColour, options);
}

/**
 * Render a row value.
 *
 * @param  {string}  value
 *     Value text to render.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered value.
 */
function renderValue(value, options) {
	if (options.colour !== true || options.valueColour === undefined) {
		return value;
	}

	return foreground(value, options.valueColour, options);
}
