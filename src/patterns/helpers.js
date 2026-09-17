import { bulletList } from "../primitives/bullet-list.js";
import { profiles } from "../profiles/profiles.js";

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
 *     Combined detail text.
 */
export function formatLabel(label, detail, options) {
	if (!isNonEmptyString(detail)) {
		return label;
	}

	if (!isNonEmptyString(label)) {
		return detail;
	}

	const separator = options.unicode === false ? " - " : " — ";

	return `${label}${separator}${detail}`;
}

/**
 * Check whether a value contains usable text.
 *
 * @param  {*}  value
 *     Value to check.
 * @returns  {boolean}
 *     Whether the value is a non-empty string.
 */
export function isNonEmptyString(value) {
	return typeof value === "string" && value !== "";
}

/**
 * Check whether a value is a non-array object.
 *
 * @param  {*}  value
 *     Value to check.
 * @returns  {boolean}
 *     Whether the value is a record.
 */
export function isRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Return usable text entries from an uncertain value.
 *
 * @param  {*}  values
 *     Values to normalise.
 * @returns  {string[]}
 *     Non-empty strings.
 */
export function normaliseStringList(values) {
	return Array.isArray(values) ? values.filter(isNonEmptyString) : [];
}

/**
 * Render a titled pattern section.
 *
 * @param  {string}  title
 *     Section title.
 * @param  {string[]}  lines
 *     Section content.
 * @param  {object}  options
 *     Rendering options.
 * @param  {boolean}  listItems
 *     Whether to show each line as a bullet point, wrapped to the terminal
 *     width. Pass false for single values, commands, or numbered lines.
 * @returns  {string}
 *     Rendered section.
 */
export function renderSection(title, lines, options, listItems = true) {
	if (lines.length === 0) {
		return "";
	}

	const heading = options.profile === profiles.AGENT ? `## ${title}` : title;

	const content = listItems
		? bulletList(lines, {
				profile: options.profile,
				unicode: options.unicode,
				width: options.width,
			})
		: lines.join("\n");

	return [heading, content].join("\n");
}

/**
 * Render a pattern title for the active profile.
 *
 * @param  {string}  title
 *     Pattern title.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered title.
 */
export function renderTitle(title, options) {
	return options.profile === profiles.AGENT ? `# ${title}` : title;
}
