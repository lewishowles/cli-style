import { foreground } from "../formatters/ansi.js";
import { chartColours } from "../theme/colours.js";

// Chart bars use the same compact default width as progress bars.
const defaultWidth = 20;

/**
 * Render multiple labelled values against a shared scale.
 *
 * @param  {object}  options
 *     Rendering options.
 * @param  {number}  options.barWidth
 *     Number of characters used by the largest bar.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @param  {object[]}  options.rows
 *     Labelled numeric values to render.
 * @param  {boolean}  options.unicode
 *     Whether Unicode bar characters should be used.
 * @returns  {string}
 *     Rendered bar chart.
 */
export function barChart(options = {}) {
	const rows = normaliseRows(options.rows);

	if (rows.length === 0) {
		return "";
	}

	const labelWidth = Math.max(...rows.map((row) => row.label.length));
	const maximum = Math.max(...rows.map((row) => Math.abs(row.value)), 1);
	const width = normaliseWidth(options.barWidth);

	return rows.map((row) => renderRow(row, labelWidth, maximum, width, options)).join("\n");
}

/**
 * Return rows with usable labels and values.
 *
 * @param  {object[]}  rows
 *     Requested chart rows.
 * @returns  {object[]}
 *     Valid chart rows.
 */
function normaliseRows(rows) {
	if (!Array.isArray(rows)) {
		return [];
	}

	return rows.filter(
		(row) =>
			row !== null &&
			typeof row === "object" &&
			typeof row.label === "string" &&
			row.label !== "" &&
			Number.isFinite(row.value),
	);
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

/**
 * Render one aligned chart row.
 *
 * @param  {object}  row
 *     Chart row.
 * @param  {number}  labelWidth
 *     Shared label width.
 * @param  {number}  maximum
 *     Largest absolute chart value.
 * @param  {number}  width
 *     Maximum bar width.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered chart row.
 */
function renderRow(row, labelWidth, maximum, width, options) {
	const barWidth = Math.round((Math.abs(row.value) / maximum) * width);
	const symbol = options.unicode === false ? "#" : "█";
	const bar = symbol.repeat(barWidth).padEnd(width, " ");
	const label = row.label.padEnd(labelWidth, " ");

	if (options.colour !== true) {
		return `${label}  ${bar} ${row.value}`;
	}

	const renderedLabel = foreground(label, chartColours.label, options);

	const renderedBar =
		barWidth === 0 ? "" : foreground(bar.slice(0, barWidth), barColour(row), options);

	const barPadding = bar.slice(barWidth);
	const renderedValue = foreground(String(row.value), chartColours.value, options);

	return `${renderedLabel}  ${renderedBar}${barPadding} ${renderedValue}`;
}

/**
 * Return the colour for a chart row.
 *
 * @param  {object}  row
 *     Chart row.
 * @returns  {string}
 *     Colour token or hex value.
 */
function barColour(row) {
	if (row.value < 0) {
		return chartColours.barNegative;
	}

	if (row.tone === "warning") {
		return chartColours.barWarning;
	}

	return chartColours.barPositive;
}
