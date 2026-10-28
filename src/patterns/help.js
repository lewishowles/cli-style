import { visibleWidth } from "../formatters/ansi.js";
import { wrapText } from "../formatters/wrap.js";
import { renderTextRole } from "../theme/roles.js";

// The narrowest description column worth keeping. Below it, each description moves onto its own line under its term.
const minimumDescriptionWidth = 20;

// Splits a command into plain text and its `<value>` or `[optional]` parts, keeping both.
const placeholderSplitPattern = /(<[^>]+>|\[[^\]]+\])/u;

// Matches a part that is wholly a `<value>` or `[optional]` placeholder.
const placeholderPattern = /^(?:<[^>]+>|\[[^\]]+\])$/u;

/**
 * Render a command's help screen with a title, usage, aligned sections, examples and a closing hint.
 *
 * @param  {object}  data
 *     The help content: `{ title, tagline, usage, sections, examples, hint }`, where each
 *     section is `{ heading, rows: [{ term, description, annotation }] }`.
 * @param  {object}  options
 *     Resolved profile, colour, accent, and terminal width.
 * @returns  {string|object}
 *     Help text with a blank line at each end, or the original data in JSON mode.
 */
export function help(data, options = {}) {
	if (options.profile === "json") {
		return data;
	}

	const lines = [""];
	const width = options.width ?? 80;

	if (data.title) {
		lines.push(renderTextRole("title", data.title, options));
	}

	if (data.tagline) {
		lines.push(renderTextRole("secondary", data.tagline, options));
	}

	appendCommands(lines, "Usage", data.usage, options);

	for (const section of data.sections ?? []) {
		appendSection(lines, section, width, options);
	}

	appendCommands(lines, "Examples", data.examples, options);

	if (data.hint) {
		lines.push("", `  ${renderTextRole("hint", data.hint, options)}`);
	}

	lines.push("");

	return lines.join("\n");
}

/**
 * Add a heading followed by commands, each after a `%` prompt.
 *
 * Commands never wrap, even past the terminal width, so they can be copied whole.
 *
 * @param  {string[]}  lines
 *     Output lines to extend.
 * @param  {string}  heading
 *     Heading shown above the commands.
 * @param  {string|string[]}  commands
 *     One or more command lines.
 * @param  {object}  options
 *     Text role rendering options.
 * @returns  {void}
 */
function appendCommands(lines, heading, commands, options) {
	const entries = Array.isArray(commands) ? commands : commands ? [commands] : [];

	if (entries.length === 0) {
		return;
	}

	lines.push("", renderTextRole("heading", heading, options));

	for (const command of entries) {
		const prompt = renderTextRole("prompt", "%", options);
		const content = styleCommand(command, options);

		lines.push(`  ${prompt} ${content}`);
	}
}

/**
 * Add a section heading and its rows, with every description in the section starting in
 * the same column. Descriptions wrap within that column, or sit on their own line under the
 * term when the column would be too narrow to read.
 *
 * @param  {string[]}  lines
 *     Output lines to extend.
 * @param  {object}  section
 *     Heading and term rows.
 * @param  {number}  width
 *     Available terminal columns.
 * @param  {object}  options
 *     Text role rendering options.
 * @returns  {void}
 */
function appendSection(lines, section, width, options) {
	const rows = section.rows ?? [];
	const termWidth = Math.max(0, ...rows.map((row) => visibleWidth(row.term)));
	const descriptionWidth = width - termWidth - 4;
	const stacked = descriptionWidth < minimumDescriptionWidth;

	lines.push("", renderTextRole("heading", capitalise(section.heading), options));

	for (const row of rows) {
		const term = styleCommand(row.term, options);

		const description = row.description ?? "";

		const descriptionWithAnnotation = row.annotation
			? `${description} ${renderTextRole("annotation", row.annotation, options)}`
			: description;

		if (stacked) {
			lines.push(...wrapText(term, Math.max(1, width - 2)).map((part) => `  ${part}`));
			lines.push(
				...wrapText(descriptionWithAnnotation, Math.max(1, width - 4)).map((part) => `    ${part}`),
			);
			continue;
		}

		const wrapped = wrapText(descriptionWithAnnotation, descriptionWidth);
		const descriptionIndent = " ".repeat(termWidth + 4);

		lines.push(`  ${term}${" ".repeat(termWidth - visibleWidth(row.term) + 2)}${wrapped[0]}`);
		lines.push(...wrapped.slice(1).map((part) => `${descriptionIndent}${part}`));
	}
}

/**
 * Style a command or term, giving its `<value>` and `[optional]` parts the placeholder style.
 *
 * @param  {string}  value
 *     Command or term with optional angle or square bracket placeholders.
 * @param  {object}  options
 *     Text role rendering options.
 * @returns  {string}
 *     Command with placeholders styled by role.
 */
function styleCommand(value, options) {
	return value
		.split(placeholderSplitPattern)
		.map((part) => {
			if (part === "") {
				return "";
			}

			if (placeholderPattern.test(part)) {
				return renderTextRole("placeholder", part, options);
			}

			return renderTextRole("command", part, options);
		})
		.join("");
}

/**
 * Capitalise the first letter of a section heading, so callers can write headings in lower case.
 *
 * @param  {string}  heading
 *     Section heading.
 * @returns  {string}
 *     Heading with its first letter capitalised.
 */
function capitalise(heading) {
	return heading.charAt(0).toUpperCase() + heading.slice(1);
}
