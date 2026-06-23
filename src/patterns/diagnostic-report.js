import { profiles } from "../profiles/profiles.js";
import { status } from "../primitives/status.js";
import { resultTypes } from "../theme/results.js";

// Diagnostic reports use a stable title when the caller does not provide one.
const defaultTitle = "Diagnostic report";

/**
 * Render check summaries, findings, skipped checks, and next actions.
 *
 * @param  {object}  report
 *     Structured diagnostic report.
 * @param  {object[]}  report.checks
 *     Checks with a name, result, and optional detail.
 * @param  {object[]}  report.findings
 *     Findings with a result and message.
 * @param  {string[]}  report.nextActions
 *     Ordered follow-up actions.
 * @param  {object[]}  report.skippedChecks
 *     Skipped checks with a name and optional reason.
 * @param  {string}  report.title
 *     Report title.
 * @param  {object}  options
 *     Rendering options.
 * @param  {string}  options.profile
 *     Active output profile.
 * @returns  {object|string}
 *     Structured JSON input or rendered diagnostic text.
 */
export function diagnosticReport(report, options = {}) {
	if (options.profile === profiles.JSON) {
		return report;
	}

	if (!isRecord(report)) {
		return "";
	}

	const sections = [
		renderChecks(report.checks, options),
		renderFindings(report.findings, options),
		renderSkippedChecks(report.skippedChecks, options),
		renderNextActions(report.nextActions, options),
	].filter((section) => section !== "");
	const title = typeof report.title === "string" && report.title !== ""
		? report.title
		: defaultTitle;
	const renderedTitle = options.profile === profiles.AGENT
		? `# ${title}`
		: title;

	return [renderedTitle, ...sections].join("\n\n");
}

/**
 * Render completed check summaries.
 *
 * @param  {object[]}  checks
 *     Checks to render.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered checks section.
 */
function renderChecks(checks, options) {
	const validChecks = Array.isArray(checks)
		? checks.filter((check) => isRecord(check) && isNonEmptyString(check.name))
		: [];
	const lines = validChecks.map((check) => status(
		check.result,
		formatLabel(check.name, check.detail, options),
		options,
	));

	return renderSection("Checks", lines, options);
}

/**
 * Render diagnostic findings.
 *
 * @param  {object[]}  findings
 *     Findings to render.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered findings section.
 */
function renderFindings(findings, options) {
	const validFindings = Array.isArray(findings)
		? findings.filter((finding) => isRecord(finding) && isNonEmptyString(finding.message))
		: [];
	const lines = validFindings.map((finding) => status(
		finding.result,
		finding.message,
		options,
	));

	return renderSection("Findings", lines, options);
}

/**
 * Render skipped checks.
 *
 * @param  {object[]}  skippedChecks
 *     Skipped checks to render.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered skipped-check section.
 */
function renderSkippedChecks(skippedChecks, options) {
	const validChecks = Array.isArray(skippedChecks)
		? skippedChecks.filter((check) => isRecord(check) && isNonEmptyString(check.name))
		: [];
	const lines = validChecks.map((check) => status(
		resultTypes.SKIPPED,
		formatLabel(check.name, check.reason, options),
		options,
	));

	return renderSection("Skipped checks", lines, options);
}

/**
 * Render ordered next actions.
 *
 * @param  {string[]}  nextActions
 *     Actions to render.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered next-action section.
 */
function renderNextActions(nextActions, options) {
	const validActions = Array.isArray(nextActions)
		? nextActions.filter(isNonEmptyString)
		: [];
	const lines = validActions.map((action, index) => `${index + 1}. ${action}`);

	return renderSection("Next actions", lines, options, false);
}

/**
 * Render a titled report section.
 *
 * @param  {string}  title
 *     Section title.
 * @param  {string[]}  lines
 *     Section content.
 * @param  {object}  options
 *     Rendering options.
 * @param  {boolean}  listItems
 *     Whether agent output should use bullet items.
 * @returns  {string}
 *     Rendered report section.
 */
function renderSection(title, lines, options, listItems = true) {
	if (lines.length === 0) {
		return "";
	}

	const heading = options.profile === profiles.AGENT
		? `## ${title}`
		: title;
	const content = options.profile === profiles.AGENT && listItems
		? lines.map((line) => `- ${line}`)
		: lines;

	return [heading, ...content].join("\n");
}

/**
 * Join a primary label and optional detail.
 *
 * @param  {string}  label
 *     Primary label.
 * @param  {*}  detail
 *     Optional detail value.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Combined status detail.
 */
function formatLabel(label, detail, options) {
	if (!isNonEmptyString(detail)) {
		return label;
	}

	const separator = options.unicode === false ? " - " : " — ";

	return `${label}${separator}${detail}`;
}

/**
 * Check whether a value is a non-array object.
 *
 * @param  {*}  value
 *     Value to check.
 * @returns  {boolean}
 *     Whether the value is a record.
 */
function isRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Check whether a value contains usable text.
 *
 * @param  {*}  value
 *     Value to check.
 * @returns  {boolean}
 *     Whether the value is a non-empty string.
 */
function isNonEmptyString(value) {
	return typeof value === "string" && value !== "";
}
