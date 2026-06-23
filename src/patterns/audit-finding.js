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

// Audit findings use a stable title when the caller does not provide one.
const defaultTitle = "Audit finding";

/**
 * Render one audit finding with evidence and remediation guidance.
 *
 * @param  {object}  finding
 *     Structured audit finding.
 * @param  {string[]}  finding.evidence
 *     Evidence supporting the finding.
 * @param  {string}  finding.finding
 *     Finding summary.
 * @param  {string}  finding.location
 *     Source location or affected area.
 * @param  {string}  finding.recommendation
 *     Recommended remediation.
 * @param  {string[]}  finding.references
 *     Supporting standards or documentation.
 * @param  {string}  finding.result
 *     Semantic severity state.
 * @param  {string}  finding.title
 *     Pattern title.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {object|string}
 *     Structured JSON input or rendered audit finding.
 */
export function auditFinding(finding, options = {}) {
	if (options.profile === profiles.JSON) {
		return finding;
	}

	if (!isRecord(finding)) {
		return "";
	}

	const title = isNonEmptyString(finding.title) ? finding.title : defaultTitle;
	const summary = isNonEmptyString(finding.finding) ? finding.finding : "";
	const evidence = normaliseStringList(finding.evidence).map((item) => `- ${item}`);
	const references = normaliseStringList(finding.references).map((item) => `- ${item}`);
	const sections = [
		status(finding.result ?? resultTypes.UNKNOWN, summary, options),
		renderLocation(finding.location, options),
		renderSection("Evidence", evidence, options, false),
		renderTextSection("Recommendation", finding.recommendation, options),
		renderSection("References", references, options, false),
	].filter((section) => section !== "");

	return [renderTitle(title, options), ...sections].join("\n\n");
}

/**
 * Render the finding location for the active profile.
 *
 * @param  {*}  location
 *     Finding location.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered location.
 */
function renderLocation(location, options) {
	if (!isNonEmptyString(location)) {
		return "";
	}

	if (options.profile === profiles.AGENT) {
		return renderSection("Location", [location], options, false);
	}

	return row("Location", location, {
		...options,
		labelWidth: 8,
	});
}

/**
 * Render a section containing one text value.
 *
 * @param  {string}  title
 *     Section title.
 * @param  {*}  value
 *     Section content.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered text section.
 */
function renderTextSection(title, value, options) {
	if (!isNonEmptyString(value)) {
		return "";
	}

	return renderSection(title, [value], options, false);
}
