import { foreground } from "../formatters/ansi.js";
import { tableColours } from "../theme/colours.js";

// Tables assume a standard terminal width when no capability is provided.
const defaultWidth = 80;

// Columns use a compact but readable gap.
const columnSeparator = "  ";

/**
 * Render tabular data with a narrow-width key/value fallback.
 *
 * @param  {object}  options
 *     Rendering options.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @param  {object[]}  options.columns
 *     Column keys and labels.
 * @param  {object[]}  options.rows
 *     Table records.
 * @param  {boolean}  options.unicode
 *     Whether Unicode rule characters should be used.
 * @param  {number}  options.width
 *     Available output width.
 * @returns  {string}
 *     Rendered table.
 */
export function table(options = {}) {
	const columns = normaliseColumns(options.columns);
	const rows = normaliseRows(options.rows);

	if (columns.length === 0 || rows.length === 0) {
		return "";
	}

	const widths = columnWidths(columns, rows);
	const naturalWidth = widths.reduce((total, width) => total + width, 0)
		+ (columnSeparator.length * (columns.length - 1));
	const availableWidth = Number.isFinite(options.width) ? options.width : defaultWidth;

	if (naturalWidth > availableWidth) {
		return renderBlocks(columns, rows, options);
	}

	return renderTable(columns, rows, widths, options);
}

/**
 * Return columns with usable keys and labels.
 *
 * @param  {object[]}  columns
 *     Requested columns.
 * @returns  {object[]}
 *     Valid columns.
 */
function normaliseColumns(columns) {
	if (!Array.isArray(columns)) {
		return [];
	}

	return columns.filter((column) => (
		column !== null
		&& typeof column === "object"
		&& typeof column.key === "string"
		&& column.key !== ""
		&& typeof column.label === "string"
		&& column.label !== ""
	));
}

/**
 * Return object records suitable for rendering.
 *
 * @param  {object[]}  rows
 *     Requested rows.
 * @returns  {object[]}
 *     Valid rows.
 */
function normaliseRows(rows) {
	if (!Array.isArray(rows)) {
		return [];
	}

	return rows.filter((row) => row !== null && typeof row === "object");
}

/**
 * Calculate the display width of each column.
 *
 * @param  {object[]}  columns
 *     Table columns.
 * @param  {object[]}  rows
 *     Table records.
 * @returns  {number[]}
 *     Column widths.
 */
function columnWidths(columns, rows) {
	return columns.map((column) => Math.max(
		column.label.length,
		...rows.map((row) => cellValue(row[column.key]).length),
	));
}

/**
 * Render a wide aligned table.
 *
 * @param  {object[]}  columns
 *     Table columns.
 * @param  {object[]}  rows
 *     Table records.
 * @param  {number[]}  widths
 *     Column widths.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered table.
 */
function renderTable(columns, rows, widths, options) {
	const header = columns
		.map((column, index) => renderHeader(
			padColumn(column.label, widths[index], index, columns.length),
			options,
		))
		.join(columnSeparator);
	const ruleCharacter = options.unicode === false ? "-" : "─";
	const rule = widths
		.map((width) => ruleCharacter.repeat(width))
		.join(columnSeparator);
	const renderedRule = options.colour === true
		? foreground(rule, tableColours.border, options)
		: rule;
	const body = rows.map((row) => columns
		.map((column, index) => renderCell(
			padColumn(cellValue(row[column.key]), widths[index], index, columns.length),
			index,
			options,
		))
		.join(columnSeparator));

	return [header, renderedRule, ...body].join("\n");
}

/**
 * Pad columns except the final visible value.
 *
 * @param  {string}  value
 *     Column text.
 * @param  {number}  width
 *     Calculated column width.
 * @param  {number}  index
 *     Zero-based column position.
 * @param  {number}  columnCount
 *     Total visible columns.
 * @returns  {string}
 *     Padded column text.
 */
function padColumn(value, width, index, columnCount) {
	return index === columnCount - 1 ? value : value.padEnd(width, " ");
}

/**
 * Render records as separated key/value blocks.
 *
 * @param  {object[]}  columns
 *     Table columns.
 * @param  {object[]}  rows
 *     Table records.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered key/value blocks.
 */
function renderBlocks(columns, rows, options) {
	const labelWidth = Math.max(...columns.map((column) => column.label.length));

	return rows.map((row) => columns
		.map((column) => {
			const label = renderHeader(column.label.padEnd(labelWidth, " "), options);
			const value = renderCell(cellValue(row[column.key]), 0, options);

			return `${label}${columnSeparator}${value}`;
		})
		.join("\n"))
		.join("\n\n");
}

/**
 * Convert a cell value to display text.
 *
 * @param  {*}  value
 *     Cell value.
 * @returns  {string}
 *     Display text.
 */
function cellValue(value) {
	return value === null || value === undefined ? "" : String(value);
}

/**
 * Render table header text.
 *
 * @param  {string}  value
 *     Header text.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered header.
 */
function renderHeader(value, options) {
	if (options.colour !== true) {
		return value;
	}

	return foreground(value, tableColours.header, options);
}

/**
 * Render table cell text.
 *
 * @param  {string}  value
 *     Cell text.
 * @param  {number}  columnIndex
 *     Zero-based column position.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered cell.
 */
function renderCell(value, columnIndex, options) {
	if (options.colour !== true) {
		return value;
	}

	const colour = columnIndex === 0
		? tableColours.primaryText
		: tableColours.secondaryText;

	return foreground(value, colour, options);
}
