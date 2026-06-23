import { profiles } from "../profiles/profiles.js";
import { row } from "../primitives/row.js";
import { status } from "../primitives/status.js";
import { resultTypes } from "../theme/results.js";
import {
	isNonEmptyString,
	isRecord,
	normaliseStringList,
	renderSection,
	renderTitle,
} from "./helpers.js";

// Command results use a stable title when the caller does not provide one.
const defaultTitle = "Command result";

/**
 * Render one command outcome with metadata and supporting details.
 *
 * @param  {object}  result
 *     Structured command result.
 * @param  {string}  result.command
 *     Executed command.
 * @param  {string[]}  result.details
 *     Supporting result details.
 * @param  {string}  result.duration
 *     Human-readable command duration.
 * @param  {number}  result.exitCode
 *     Command exit code.
 * @param  {string}  result.result
 *     Semantic result state.
 * @param  {string}  result.summary
 *     Short outcome summary.
 * @param  {string}  result.title
 *     Pattern title.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {object|string}
 *     Structured JSON input or rendered command result.
 */
export function commandResult(result, options = {}) {
	if (options.profile === profiles.JSON) {
		return result;
	}

	if (!isRecord(result)) {
		return "";
	}

	const title = isNonEmptyString(result.title) ? result.title : defaultTitle;
	const metadata = renderMetadata(result, options);
	const details = normaliseStringList(result.details).map((detail) => `- ${detail}`);
	const summary = isNonEmptyString(result.summary) ? result.summary : "";
	const sections = [
		status(result.result ?? resultTypes.UNKNOWN, summary, options),
		metadata,
		renderSection("Details", details, options, false),
	].filter((section) => section !== "");

	return [renderTitle(title, options), ...sections].join("\n\n");
}

/**
 * Render command metadata for human or agent output.
 *
 * @param  {object}  result
 *     Structured command result.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered metadata.
 */
function renderMetadata(result, options) {
	const entries = [
		isNonEmptyString(result.command) ? ["Command", result.command] : null,
		Number.isInteger(result.exitCode) ? ["Exit code", String(result.exitCode)] : null,
		isNonEmptyString(result.duration) ? ["Duration", result.duration] : null,
	].filter((entry) => entry !== null);

	if (options.profile === profiles.AGENT) {
		const lines = entries.map(([label, value]) => `- ${label}: ${value}`);

		return renderSection("Metadata", lines, options, false);
	}

	return entries
		.map(([label, value]) => row(label, value, {
			...options,
			labelWidth: 9,
		}))
		.join("\n");
}
