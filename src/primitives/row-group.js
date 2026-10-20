import { visibleWidth } from "../formatters/ansi.js";
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
		...rows.map((entry) => displayedLabelWidth(entry, options)),
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
 * Count the columns a row's label fills, including its result symbol when it
 * has one.
 *
 * @param  {object}  entry
 *     Row entry.
 * @param  {object}  options
 *     Group rendering options.
 * @returns  {number}
 *     The number of terminal columns the label takes up.
 */
function displayedLabelWidth(entry, options) {
	if (typeof entry.result !== "string" || entry.result === "") {
		return visibleWidth(entry.label);
	}

	const entryOptions = {
		...options,
		...entry,
	};

	const symbol = getResultSymbol(entry.result, entryOptions);

	return visibleWidth([symbol, entry.label].join(" "));
}
