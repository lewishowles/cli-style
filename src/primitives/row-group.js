import { getResultSymbol } from "../theme/results.js";
import { row } from "./row.js";

/**
 * Render related labelled values against a shared label width.
 *
 * @param  {object}  options
 *     Rendering options.
 * @param  {number}  options.labelWidth
 *     Optional minimum label width.
 * @param  {object[]}  options.rows
 *     Labelled values to render.
 * @returns  {string}
 *     Rendered row group.
 */
export function rowGroup(options = {}) {
	const rows = normaliseRows(options.rows);

	if (rows.length === 0) {
		return "";
	}

	const labelWidth = Math.max(
		...rows.map((entry) => displayedLabelLength(entry, options)),
		options.labelWidth ?? 0,
	);

	return rows
		.map((entry) =>
			row(entry.label, entry.value ?? "", {
				...options,
				...entry,
				labelWidth,
			}),
		)
		.join("\n");
}

/**
 * Return rows with usable labels.
 *
 * @param  {object[]}  rows
 *     Requested row entries.
 * @returns  {object[]}
 *     Valid row entries.
 */
function normaliseRows(rows) {
	if (!Array.isArray(rows)) {
		return [];
	}

	return rows.filter(
		(entry) =>
			entry !== null &&
			typeof entry === "object" &&
			typeof entry.label === "string" &&
			entry.label !== "",
	);
}

/**
 * Return the visible width of a row label.
 *
 * @param  {object}  entry
 *     Row entry.
 * @param  {object}  options
 *     Group rendering options.
 * @returns  {number}
 *     Displayed label length.
 */
function displayedLabelLength(entry, options) {
	if (typeof entry.result !== "string" || entry.result === "") {
		return entry.label.length;
	}

	const entryOptions = {
		...options,
		...entry,
	};

	const symbol = getResultSymbol(entry.result, entryOptions);

	return [symbol, entry.label].join(" ").length;
}
