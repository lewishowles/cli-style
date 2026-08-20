import { foreground, style } from "../formatters/ansi.js";
import { getResultSymbol, resultTypes } from "../theme/results.js";
import { labelledLine } from "./labelled-line.js";
import { panel } from "./panel.js";

/**
 * Render an informational hint.
 *
 * @param  {string}  message
 *     Hint text.
 * @param  {object}  options
 *     Rendering options.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @returns  {string}
 *     Rendered hint.
 */
export function hint(message = "", options = {}) {
	return labelledLine("Hint", message, {
		icon: "i",
		tone: "info",
		...options,
	});
}

/**
 * Render an empty-state message.
 *
 * @param  {string}  title
 *     Empty-state title.
 * @param  {string}  detail
 *     Optional supporting detail.
 * @param  {object}  options
 *     Rendering options.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @param  {boolean}  options.unicode
 *     Whether Unicode symbols should be used.
 * @returns  {string}
 *     Rendered empty state.
 */
export function emptyState(title = "No results", detail = "", options = {}) {
	const symbol = getResultSymbol(resultTypes.SKIPPED, options);
	const prefix = `${symbol} ${title}`;
	const detailText = detail === "" ? "" : ` ${detail}`;

	if (options.colour !== true) {
		return `${prefix}${detailText}`;
	}

	const renderedPrefix = style(foreground(prefix, "muted", options), "bold", options);

	return `${renderedPrefix}${detailText}`;
}

/**
 * Render a structured error block.
 *
 * @param  {string}  title
 *     Error title.
 * @param  {string[]}  lines
 *     Supporting error details.
 * @param  {object}  options
 *     Rendering options.
 * @param  {boolean}  options.unicode
 *     Whether Unicode symbols should be used.
 * @returns  {string}
 *     Rendered error block.
 */
export function errorBlock(title = "Failed", lines = [], options = {}) {
	const symbol = getResultSymbol(resultTypes.FAILED, options);
	const detailLines = Array.isArray(lines) ? lines : [];

	return panel({
		...options,
		lines: detailLines,
		title: `${symbol} Error: ${title}`,
		tone: "danger",
	});
}
