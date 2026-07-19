import { foreground } from "../formatters/ansi.js";
import { getToneColour } from "../theme/colours.js";

// Sparklines balance useful resolution with compact terminal output.
const defaultWidth = 20;

// Success gives an unconfigured trend a familiar positive semantic tone.
const defaultTone = "success";

// Unicode levels show eight graduated values without needing colour.
const unicodeSymbols = "▁▂▃▄▅▆▇█";

// ASCII levels provide the same eight-step visual fallback.
const asciiSymbols = "._-:=+*#";

/**
 * Render a compact trend with stable numeric context.
 *
 * @param  {object}  options
 *     Rendering options.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @param  {string}  options.label
 *     Optional trend label.
 * @param  {string}  options.tone
 *     Semantic colour tone for the trend.
 * @param  {boolean}  options.unicode
 *     Whether graduated Unicode characters should be used.
 * @param  {number[]}  options.values
 *     Finite numeric values in time order.
 * @param  {number}  options.width
 *     Maximum number of plotted samples.
 * @returns  {string}
 *     Rendered sparkline, or an empty string for unusable values.
 */
export function sparkline(options = {}) {
	const values = normaliseValues(options.values);

	if (values.length === 0) {
		return "";
	}

	const range = resolveRange(values);
	const width = normaliseWidth(options.width);
	const sampledValues = sampleValues(values, width, range);
	const symbols = options.unicode === false ? asciiSymbols : unicodeSymbols;
	const trend = sampledValues.map((value) => renderValue(value, range, symbols)).join("");
	const numericText = `latest=${values.at(-1)} min=${range.minimum} max=${range.maximum}`;

	const label =
		typeof options.label === "string" && options.label !== "" ? `${options.label}: ` : "";

	const renderedTrend = renderTrend(trend, options);

	return `${label}${renderedTrend} ${numericText}`;
}

/**
 * Return finite numeric values when the input is usable.
 *
 * @param  {*}  values
 *     Requested trend values.
 * @returns  {number[]}
 *     Finite values, or an empty array.
 */
function normaliseValues(values) {
	if (
		!Array.isArray(values) ||
		values.length === 0 ||
		values.some((value) => !Number.isFinite(value))
	) {
		return [];
	}

	return values;
}

/**
 * Return a usable positive integer plot width.
 *
 * @param  {number}  width
 *     Requested plot width.
 * @returns  {number}
 *     Positive integer width.
 */
function normaliseWidth(width) {
	if (!Number.isFinite(width)) {
		return defaultWidth;
	}

	return Math.max(Math.floor(width), 1);
}

/**
 * Resolve the shared scale and extrema indexes for a trend.
 *
 * @param  {number[]}  values
 *     Finite trend values.
 * @returns  {object}
 *     Trend range and first extrema indexes.
 */
function resolveRange(values) {
	let minimum = values[0];
	let maximum = values[0];
	let minimumIndex = 0;
	let maximumIndex = 0;

	for (let index = 1; index < values.length; index += 1) {
		if (values[index] < minimum) {
			minimum = values[index];
			minimumIndex = index;
		}

		if (values[index] > maximum) {
			maximum = values[index];
			maximumIndex = index;
		}
	}

	return {
		maximum,
		maximumIndex,
		minimum,
		minimumIndex,
	};
}

/**
 * Reduce values to deterministic plotted samples while retaining key points.
 *
 * @param  {number[]}  values
 *     Finite trend values.
 * @param  {number}  width
 *     Maximum number of plotted samples.
 * @param  {object}  range
 *     Shared trend range and extrema indexes.
 * @returns  {number[]}
 *     Sampled values in their original order.
 */
function sampleValues(values, width, range) {
	if (values.length <= width) {
		return values;
	}

	const latestIndex = values.length - 1;
	const requiredIndexes = [...new Set([latestIndex, range.minimumIndex, range.maximumIndex])];
	const selectedIndexes = new Set(requiredIndexes.slice(0, width));

	const evenlySpacedIndexes = Array.from({ length: width }, (_, index) =>
		Math.round((index * (values.length - 1)) / Math.max(width - 1, 1)),
	);

	for (const index of evenlySpacedIndexes) {
		if (selectedIndexes.size >= width) {
			break;
		}

		selectedIndexes.add(index);
	}

	for (let index = 0; selectedIndexes.size < width; index += 1) {
		selectedIndexes.add(index);
	}

	return [...selectedIndexes].sort((left, right) => left - right).map((index) => values[index]);
}

/**
 * Map one value onto the active graduated character set.
 *
 * @param  {number}  value
 *     Value to render.
 * @param  {object}  range
 *     Full trend range used for the shared scale.
 * @param  {string}  symbols
 *     Graduated characters.
 * @returns  {string}
 *     One trend character.
 */
function renderValue(value, range, symbols) {
	if (range.minimum === range.maximum) {
		return symbols[Math.floor((symbols.length - 1) / 2)];
	}

	const ratio = (value - range.minimum) / (range.maximum - range.minimum);
	const symbolIndex = Math.round(ratio * (symbols.length - 1));

	return symbols[symbolIndex];
}

/**
 * Apply a semantic tone only when colour output is explicitly enabled.
 *
 * @param  {string}  trend
 *     Uncoloured trend text.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Trend text with optional ANSI colour.
 */
function renderTrend(trend, options) {
	if (options.colour !== true) {
		return trend;
	}

	const tone = getToneColour(options.tone, options) === null ? defaultTone : options.tone;

	return foreground(trend, tone, options);
}
