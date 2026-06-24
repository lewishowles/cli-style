import { profiles } from "../profiles/profiles.js";
import { table } from "../primitives/table.js";
import {
	isNonEmptyString,
	isRecord,
	renderTitle,
} from "./helpers.js";

// Compact data tables use a stable title when the caller does not provide one.
const defaultTitle = "Data";

/**
 * Render dense records with optional summary context.
 *
 * @param  {object}  data
 *     Structured table data.
 * @param  {object[]}  data.columns
 *     Table column keys and labels.
 * @param  {object[]}  data.rows
 *     Table records.
 * @param  {string}  data.summary
 *     Optional summary context.
 * @param  {string}  data.title
 *     Pattern title.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {object|string}
 *     Structured JSON input or rendered compact table.
 */
export function compactDataTable(data, options = {}) {
	if (options.profile === profiles.JSON) {
		return data;
	}

	if (!isRecord(data) || !hasEntries(data.columns) || !hasEntries(data.rows)) {
		return "";
	}

	const title = isNonEmptyString(data.title) ? data.title : defaultTitle;
	const summary = isNonEmptyString(data.summary) ? data.summary : "";
	const renderedTable = table({
		...options,
		columns: data.columns,
		rows: data.rows,
	});
	const heading = summary === ""
		? renderTitle(title, options)
		: [renderTitle(title, options), summary].join("\n");

	if (renderedTable === "") {
		return "";
	}

	return [heading, renderedTable].join("\n\n");
}

/**
 * Check whether a value is a non-empty array.
 *
 * @param  {*}  value
 *     Value to check.
 * @returns  {boolean}
 *     Whether the value contains entries.
 */
function hasEntries(value) {
	return Array.isArray(value) && value.length > 0;
}
