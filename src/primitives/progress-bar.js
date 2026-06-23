import { foreground } from "../formatters/ansi.js";
import { getToneColour } from "../theme/colours.js";

// Progress bars balance useful resolution with compact terminal output.
const defaultWidth = 20;

// Success is the default tone for work progressing normally.
const defaultTone = "success";

// Invalid maxima fall back to a percentage-friendly range.
const defaultMaximum = 100;

/**
 * Render a single value against a maximum.
 *
 * @param  {object}  options
 *     Rendering options.
 * @param  {number}  options.barWidth
 *     Number of characters used by the bar.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @param  {number}  options.max
 *     Maximum progress value.
 * @param  {string}  options.tone
 *     Semantic colour tone for completed progress.
 * @param  {boolean}  options.unicode
 *     Whether Unicode bar characters should be used.
 * @param  {number}  options.value
 *     Current progress value.
 * @returns  {string}
 *     Rendered progress bar.
 */
export function progressBar(options = {}) {
	const maximum = normaliseMaximum(options.max);
	const value = normaliseValue(options.value);
	const width = normaliseWidth(options.barWidth);
	const ratio = Math.min(Math.max(value / maximum, 0), 1);
	const filledWidth = Math.round(width * ratio);
	const emptyWidth = width - filledWidth;
	const symbols = barSymbols(options);
	const filled = symbols.filled.repeat(filledWidth);
	const empty = symbols.empty.repeat(emptyWidth);
	const percentage = Math.round(ratio * 100);
	const numericText = `${percentage}% (${value}/${maximum})`;

	if (options.colour !== true) {
		return `[${filled}${empty}] ${numericText}`;
	}

	const tone = getToneColour(options.tone) === null ? defaultTone : options.tone;
	const renderedFilled = filled === "" ? "" : foreground(filled, tone ?? defaultTone, options);
	const renderedEmpty = empty === "" ? "" : foreground(empty, "muted", options);

	return `[${renderedFilled}${renderedEmpty}] ${numericText}`;
}

/**
 * Return progress characters for the active capability.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {object}
 *     Filled and empty progress symbols.
 */
function barSymbols(options) {
	if (options.unicode === false) {
		return {
			empty: "-",
			filled: "#",
		};
	}

	return {
		empty: "░",
		filled: "█",
	};
}

/**
 * Return a usable maximum.
 *
 * @param  {number}  maximum
 *     Requested maximum.
 * @returns  {number}
 *     Positive finite maximum.
 */
function normaliseMaximum(maximum) {
	if (!Number.isFinite(maximum) || maximum <= 0) {
		return defaultMaximum;
	}

	return maximum;
}

/**
 * Return a usable progress value.
 *
 * @param  {number}  value
 *     Requested progress value.
 * @returns  {number}
 *     Finite progress value.
 */
function normaliseValue(value) {
	return Number.isFinite(value) ? value : 0;
}

/**
 * Return a usable integer bar width.
 *
 * @param  {number}  width
 *     Requested bar width.
 * @returns  {number}
 *     Positive integer width.
 */
function normaliseWidth(width) {
	if (!Number.isFinite(width)) {
		return defaultWidth;
	}

	return Math.max(Math.floor(width), 1);
}
