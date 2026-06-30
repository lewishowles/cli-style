import { isNonEmptyString } from "../patterns/helpers.js";
import { divider } from "../primitives/divider.js";
import { status as renderStatus } from "../primitives/status.js";
import {
	getHighestSeverityResult,
	getResultToken,
	resultTypes,
	severityOrder,
} from "../theme/results.js";

// Reporter output default options.
const reporterDefaults = {
	colour: false,
	unicode: true,
	verbose: false,
};

/**
 * Create a pure string reporter for grouped CLI output.
 *
 * @param  {object}  options
 *     Rendering and reporter options.
 * @param  {boolean}  options.verbose
 *     Whether groups should include detail rows by default.
 * @returns  {object}
 *     Reporter helpers.
 */
export function createReporter(options = {}) {
	const reporterOptions = {
		...reporterDefaults,
		...options,
	};
	const lines = [];

	return {
		divider: (label, detail = "", dividerOptions = {}) => append(lines, renderReporterDivider(label, detail, {
			...reporterOptions,
			...dividerOptions,
		})),
		group: (label, items = [], groupOptions = {}) => append(lines, renderGroup(label, items, {
			...reporterOptions,
			...groupOptions,
		})),
		lines,
		render: () => lines.join("\n"),
		section: (label, detail = "", sectionOptions = {}) => append(lines, renderSection(label, detail, {
			...reporterOptions,
			...sectionOptions,
		})),
		status: (resultType, label, detail = "", statusOptions = {}) => append(lines, renderReporterStatus(resultType, label, detail, {
			...reporterOptions,
			...statusOptions,
		})),
	};
}

/**
 * Render a reporter phase divider.
 *
 * @param  {string}  label
 *     Divider label.
 * @param  {string}  detail
 *     Optional supporting detail.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered divider.
 */
export function renderReporterDivider(label, detail = "", options = {}) {
	return divider({
		...options,
		label: formatLabel(label, detail),
	});
}

/**
 * Render a reporter group without mutating a reporter instance.
 *
 * @param  {string}  label
 *     Group label.
 * @param  {object[]}  items
 *     Child result rows.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered group.
 */
export function renderGroup(label, items = [], options = {}) {
	const normalisedItems = normaliseItems(items);
	const resultType = options.result ?? getHighestSeverityResult(normalisedItems.map((item) => item.result));
	const summary = options.summary ?? summariseItems(normalisedItems);
	const groupLine = renderReporterStatus(resultType, label, summary, options);

	if (options.verbose !== true || normalisedItems.length === 0) {
		return groupLine;
	}

	const detailLines = normalisedItems.map((item) => {
		const line = renderReporterStatus(item.result, item.label, item.detail, options);

		return `  ${line}`;
	});

	return [groupLine, ...detailLines].join("\n");
}

/**
 * Render a reporter section heading.
 *
 * @param  {string}  label
 *     Section label.
 * @param  {string}  detail
 *     Optional detail.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered section row.
 */
export function renderSection(label, detail = "", options = {}) {
	return renderReporterStatus(resultTypes.INFO, label, detail, options);
}

/**
 * Render one reporter status row.
 *
 * @param  {string}  resultType
 *     Result type.
 * @param  {string}  label
 *     Row label.
 * @param  {string}  detail
 *     Optional detail.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered status row.
 */
export function renderReporterStatus(resultType, label, detail = "", options = {}) {
	return renderStatus(resultType, detail, {
		...options,
		label,
	});
}

/**
 * Append a rendered line to the reporter state.
 *
 * @param  {string[]}  lines
 *     Reporter lines.
 * @param  {string}  value
 *     Rendered value.
 * @returns  {string}
 *     Appended value.
 */
function append(lines, value) {
	lines.push(value);

	return value;
}

/**
 * Combine a label and optional detail for compact phase dividers.
 *
 * @param  {string}  label
 *     Main label.
 * @param  {string}  detail
 *     Optional supporting detail.
 * @returns  {string}
 *     Combined label.
 */
function formatLabel(label, detail) {
	if (!isNonEmptyString(detail)) {
		return label;
	}

	return `${label} · ${detail}`;
}

/**
 * Keep only rows that can render useful output.
 *
 * @param  {object[]}  items
 *     Caller-provided items.
 * @returns  {object[]}
 *     Normalised items.
 */
function normaliseItems(items) {
	if (!Array.isArray(items)) {
		return [];
	}

	return items
		.filter((item) => item !== null && typeof item === "object")
		.map((item) => ({
			detail: isNonEmptyString(item.detail) ? item.detail : "",
			label: isNonEmptyString(item.label) ? item.label : getResultToken(item.result).label,
			result: getResultToken(item.result) === getResultToken(resultTypes.UNKNOWN)
				? resultTypes.UNKNOWN
				: item.result,
		}));
}

/**
 * Summarise grouped items by result label.
 *
 * @param  {object[]}  items
 *     Normalised group items.
 * @returns  {string}
 *     Human-readable count summary.
 */
function summariseItems(items) {
	if (items.length === 0) {
		return "";
	}

	const counts = new Map();

	for (const item of items) {
		counts.set(item.result, (counts.get(item.result) ?? 0) + 1);
	}

	return [...counts.entries()]
		.sort(([left], [right]) => resultPriority(left) - resultPriority(right))
		.map(([resultType, count]) => formatCount(resultType, count))
		.join(", ");
}

/**
 * Format a result count.
 *
 * @param  {string}  resultType
 *     Result type.
 * @param  {number}  count
 *     Result count.
 * @returns  {string}
 *     Count label.
 */
function formatCount(resultType, count) {
	const token = getResultToken(resultType);
	const label = token.label.toLowerCase();

	return `${count} ${label}`;
}

/**
 * Resolve a result's severity index.
 *
 * @param  {string}  resultType
 *     Result type.
 * @returns  {number}
 *     Priority index.
 */
function resultPriority(resultType) {
	const highestResult = getHighestSeverityResult([resultType]);

	return severityOrder.indexOf(highestResult);
}
