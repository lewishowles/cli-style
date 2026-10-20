import { background, foreground, restoreStyles, style } from "../formatters/ansi.js";
import { chipColours } from "../theme/colours.js";

// Chip style used when the requested tone is not configured.
const fallbackTone = "neutral";

/**
 * Render a compact label chip.
 *
 * @param  {string}  label
 *     Label text to render.
 * @param  {string}  tone
 *     Chip tone to use.
 * @param  {object}  options
 *     Rendering options.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @returns  {string}
 *     Rendered chip.
 */
export function chip(label, tone = fallbackTone, options = {}) {
	const token = chipColours[tone] ?? chipColours[fallbackTone];

	if (options.colour !== true || options.theme === "auto") {
		return `[${label}]`;
	}

	// The label with the chip's fill, bold and tone switched back on after any coloured text,
	// so the rest of the chip keeps its look.
	const restoredLabel = restoreStyles(label, [
		background("", token.background, options),
		style("", "bold", options),
		foreground("", token.foreground, options),
	]);

	const paddedLabel = ` ${restoredLabel} `;
	const colouredLabel = foreground(paddedLabel, token.foreground, options);
	const boldLabel = style(colouredLabel, "bold", options);

	return background(boldLabel, token.background, options);
}
