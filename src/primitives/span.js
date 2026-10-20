import { foreground, restoreStyles, style } from "../formatters/ansi.js";

// Inline spans use the same informational tone as hints by default.
const defaultTone = "info";

// Inline emphasis should remain visible without forcing a block-level renderer.
const defaultWeight = "bold";

/**
 * Render an inline text span.
 *
 * @param  {string}  value
 *     Text to render.
 * @param  {string}  tone
 *     Colour tone for the span.
 * @param  {object}  options
 *     Rendering options.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @param  {string}  options.weight
 *     Optional ANSI text weight.
 * @returns  {string}
 *     Rendered span.
 */
export function span(value = "", tone = defaultTone, options = {}) {
	if (options.colour !== true) {
		return value;
	}

	// The text weight, bold unless the options ask for another.
	const weight = options.weight ?? defaultWeight;

	// The text with the span's weight and tone switched back on after any coloured text.
	const restoredValue = restoreStyles(value, [
		style("", weight, options),
		foreground("", tone, options),
	]);

	const renderedValue = foreground(restoredValue, tone, options);

	return style(renderedValue, weight, options);
}
