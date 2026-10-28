import { expandTabs, padVisible, sliceVisible, visibleWidth } from "../formatters/ansi.js";
import { defaultWidth, minimumWidth, normaliseWidth } from "../formatters/width.js";
import { renderTextRole, textRoles } from "../theme/roles.js";

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
 *     Column keys and labels. A column may set maxWidth to cap its width,
 *     with overflow ('truncate', the default, or 'wrap') controlling how
 *     values beyond that width render.
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

	const naturalWidth =
		widths.reduce((total, width) => total + width, 0) +
		columnSeparator.length * (columns.length - 1);

	const requestedWidth = Number.isFinite(options.width) ? options.width : undefined;

	// Let a requested width smaller than minimumWidth pass through unclamped.
	const minimumTableWidth =
		requestedWidth === undefined
			? minimumWidth
			: Math.max(1, Math.min(requestedWidth, minimumWidth));

	const availableWidth = normaliseWidth(requestedWidth, {
		defaultWidth,
		minWidth: minimumTableWidth,
	});

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

	return columns
		.filter(
			(column) =>
				column !== null &&
				typeof column === "object" &&
				typeof column.key === "string" &&
				column.key !== "" &&
				typeof column.label === "string" &&
				column.label !== "",
		)
		.map((column) => ({ ...column, label: expandTabs(column.label) }));
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
	return columns.map((column) => {
		const naturalWidth = Math.max(
			visibleWidth(column.label),
			...rows.map((row) => visibleWidth(cellValue(row[column.key]))),
		);

		const maxWidth = columnMaxWidth(column);

		return maxWidth === null ? naturalWidth : Math.min(naturalWidth, maxWidth);
	});
}

/**
 * Return a column's configured width cap, if any.
 *
 * @param  {object}  column
 *     Table column.
 * @returns  {number|null}
 *     Normalised maxWidth, or null when the column has none.
 */
function columnMaxWidth(column) {
	if (!Number.isFinite(column.maxWidth) || column.maxWidth < 1) {
		return null;
	}

	return normaliseWidth(column.maxWidth, {
		defaultWidth: 1,
		minWidth: 1,
	});
}

/**
 * Split a cell's value into the lines it renders as within a fixed-width column.
 *
 * @param  {string}  value
 *     Cell value.
 * @param  {object}  column
 *     Table column, read for its overflow mode.
 * @param  {number}  width
 *     Column width.
 * @returns  {string[]}
 *     Lines the cell renders as, each no wider on screen than the column
 *     unless one character is wider than the whole column. A value that does
 *     not fit is cut to one line with a trailing ellipsis, or split across
 *     lines when the column's overflow is 'wrap'. Coloured text keeps its
 *     colour on every line.
 */
function columnLines(value, column, width) {
	if (visibleWidth(value) <= width) {
		return [value];
	}

	if (column.overflow === "wrap") {
		const lines = [];

		let remaining = value;

		while (remaining !== "") {
			let { head, tail } = sliceVisible(remaining, width);

			if (visibleWidth(head) === 0 && tail !== "") {
				// In a one-column cell, a two-column character gets a line of its own so wrapping always moves forward.
				({ head, tail } = sliceVisible(remaining, 2));
			}

			lines.push(head);
			remaining = tail;
		}

		return lines;
	}

	return [`${sliceVisible(value, width - 1).head}…`];
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
		.map((column, index) => {
			const headerLine = columnLines(column.label, { overflow: "truncate" }, widths[index])[0];

			return renderHeader(padColumn(headerLine, widths[index], index, columns.length), options);
		})
		.join(columnSeparator);

	const ruleCharacter = options.unicode === false ? "-" : "─";
	const rule = widths.map((width) => ruleCharacter.repeat(width)).join(columnSeparator);

	// The rule under the header, dimmed so it stays behind the text.
	const renderedRule = renderTextRole(textRoles.SECONDARY, rule, options);

	const body = rows.flatMap((row) => {
		const lines = columns.map((column, index) =>
			columnLines(cellValue(row[column.key]), column, widths[index]),
		);

		const lineCount = Math.max(...lines.map((column) => column.length));

		return Array.from(
			{
				length: lineCount,
			},
			(_, lineIndex) =>
				columns
					.map((column, index) =>
						renderCell(
							padColumn(lines[index][lineIndex] ?? "", widths[index], index, columns.length),
							index,
							options,
						),
					)
					.join(columnSeparator),
		);
	});

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
	return index === columnCount - 1 ? value : padVisible(value, width);
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
	const labelWidth = Math.max(...columns.map((column) => visibleWidth(column.label)));

	return rows
		.map((row) =>
			columns
				.map((column) => {
					const label = renderHeader(padVisible(column.label, labelWidth), options);
					const value = renderCell(cellValue(row[column.key]), 0, options);

					return `${label}${columnSeparator}${value}`;
				})
				.join("\n"),
		)
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
	return value === null || value === undefined ? "" : expandTabs(String(value));
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
	return renderTextRole(textRoles.HEADING, value, options);
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
	// The first column names the row, so it reads as normal text; later columns are dimmed detail.
	const role = columnIndex === 0 ? textRoles.TEXT : textRoles.SECONDARY;

	return renderTextRole(role, value, options);
}
