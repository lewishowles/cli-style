import { foreground, style } from "../formatters/ansi.js";
import { getResultSymbol, getResultToken, resultTypes } from "../theme/results.js";

/**
 * Render a result status line.
 *
 * @param  {string}  resultType
 *     Result type to render.
 * @param  {string}  detail
 *     Optional detail text.
 * @param  {object}  options
 *     Rendering options.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @param  {string}  options.label
 *     Optional text label override.
 * @param  {boolean}  options.unicode
 *     Whether Unicode symbols should be used.
 * @returns  {string}
 *     Rendered status line.
 */
export function status(resultType = resultTypes.UNKNOWN, detail = "", options = {}) {
	const token = getResultToken(resultType);
	const symbol = getResultSymbol(resultType, options);

	const label =
		typeof options.label === "string" && options.label !== "" ? options.label : token.label;

	const prefix = `${symbol} ${label}`;
	const detailText = detail === "" ? "" : ` ${detail}`;

	if (options.colour !== true) {
		return `${prefix}${detailText}`;
	}

	const colouredPrefix = foreground(prefix, token.tone, options);
	const boldPrefix = style(colouredPrefix, "bold", options);

	return `${boldPrefix}${detailText}`;
}
