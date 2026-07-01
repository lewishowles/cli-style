import { profiles } from "../profiles/profiles.js";
import { status } from "../primitives/status.js";
import { resultTypes } from "../theme/results.js";
import {
	formatLabel,
	isNonEmptyString,
	isRecord,
	normaliseStringList,
	renderSection,
	renderTitle,
} from "./helpers.js";

// Task summaries use a stable title when the caller does not provide one.
const defaultTitle = "Task summary";

/**
 * Render completed and remaining work for one task.
 *
 * @param  {object}  summary
 *     Structured task summary.
 * @param  {string[]}  summary.completed
 *     Completed work.
 * @param  {string[]}  summary.remaining
 *     Remaining work.
 * @param  {string}  summary.result
 *     Semantic result state.
 * @param  {string}  summary.summary
 *     Short supporting summary.
 * @param  {string}  summary.task
 *     Task name.
 * @param  {string}  summary.title
 *     Pattern title.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {object|string}
 *     Structured JSON input or rendered task summary.
 */
export function taskSummary(summary, options = {}) {
	if (options.profile === profiles.JSON) {
		return summary;
	}

	if (!isRecord(summary)) {
		return "";
	}

	const title = isNonEmptyString(summary.title) ? summary.title : defaultTitle;
	const task = isNonEmptyString(summary.task) ? summary.task : "";
	const detail = formatLabel(task, summary.summary, options);
	const completed = normaliseStringList(summary.completed).map((item) => `- ${item}`);
	const remaining = normaliseStringList(summary.remaining).map((item) => `- ${item}`);

	const sections = [
		status(summary.result ?? resultTypes.UNKNOWN, detail, options),
		renderSection("Completed", completed, options, false),
		renderSection("Remaining", remaining, options, false),
	].filter((section) => section !== "");

	return [renderTitle(title, options), ...sections].join("\n\n");
}
