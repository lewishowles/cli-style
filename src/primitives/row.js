import { foreground } from "../formatters/ansi.js";
import { getResultSymbol, getResultToken } from "../theme/results.js";

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
 * @param  {string}  options.result
 *     Optional semantic result state for the row.
 * @param  {string}  options.separator
 *     Text between label and value.
 * @param  {string}  options.valueColour
 *     Optional colour token for the value.
 * @returns  {string}
 *     Rendered row.
 */
export function row(label, value = "", options = {}) {
	const resultToken = resolveResultToken(options);
	const displayLabel = renderDisplayLabel(label, resultToken, options);
	const labelWidth = Math.max(displayLabel.length, options.labelWidth ?? 0);
	const labelText = displayLabel.padEnd(labelWidth, " ");
	const renderedLabel = renderLabel(labelText, options);

	if (value === "") {
		return renderedLabel;
	}

	const renderedValue = renderValue(value, options);
	const separator = options.separator ?? defaultSeparator;

	return `${renderedLabel}${separator}${renderedValue}`;
}

/**
 * Resolve the row's optional result token.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {object|null}
 *     Result token when a row result is provided.
 */
function resolveResultToken(options) {
	if (typeof options.result !== "string" || options.result === "") {
		return null;
	}

	return getResultToken(options.result);
}

/**
 * Render the visible row label, including any result symbol.
 *
 * @param  {string}  label
 *     Label text to render.
 * @param  {object|null}  resultToken
 *     Optional result token.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Label text with any result prefix.
 */
function renderDisplayLabel(label, resultToken, options) {
	if (resultToken === null) {
		return label;
	}

	const symbol = getResultSymbol(options.result, options);

	return `${symbol} ${label}`;
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

	return foreground(label, getLabelColour(options), options);
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
	if (options.colour !== true) {
		return value;
	}

	const colour = getValueColour(options);

	if (colour === undefined) {
		return value;
	}

	return foreground(value, colour, options);
}

/**
 * Resolve the colour token for the row label.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Colour token for the label.
 */
function getLabelColour(options) {
	if (options.labelColour !== undefined) {
		return options.labelColour;
	}

	if (typeof options.result === "string" && options.result !== "") {
		return getResultToken(options.result).tone;
	}

	return defaultLabelColour;
}

/**
 * Resolve the colour token for the row value.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string|undefined}
 *     Colour token for the value.
 */
function getValueColour(options) {
	if (options.valueColour !== undefined) {
		return options.valueColour;
	}

	if (typeof options.result === "string" && options.result !== "") {
		return getResultToken(options.result).tone;
	}

	return undefined;
}
