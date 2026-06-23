import { background, foreground, style } from "../formatters/ansi.js";
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

	if (options.colour !== true) {
		return `[${label}]`;
	}

	const paddedLabel = ` ${label} `;
	const colouredLabel = foreground(paddedLabel, token.foreground, options);
	const boldLabel = style(colouredLabel, "bold", options);

	return background(boldLabel, token.background, options);
}
