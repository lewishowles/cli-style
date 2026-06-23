import { profiles } from "../profiles/profiles.js";
import { chip } from "../primitives/chip.js";
import {
	isNonEmptyString,
	isRecord,
	normaliseStringList,
	renderTitle,
} from "./helpers.js";

// Transcript roles map machine-facing values to stable textual labels and tones.
const transcriptRoles = {
	agent: {
		label: "Agent",
		tone: "agent",
	},
	system: {
		label: "System",
		tone: "neutral",
	},
	tool: {
		label: "Tool",
		tone: "info",
	},
	user: {
		label: "User",
		tone: "user",
	},
};

// Unsupported roles remain visible without inventing new semantics.
const fallbackRole = {
	label: "Participant",
	tone: "neutral",
};

// Agent transcripts use a stable title when the caller does not provide one.
const defaultTitle = "Agent transcript";

/**
 * Render role-labelled agent exchanges and tool output.
 *
 * @param  {object}  transcript
 *     Structured transcript.
 * @param  {object[]}  transcript.entries
 *     Role-labelled transcript entries.
 * @param  {string}  transcript.title
 *     Transcript title.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {object|string}
 *     Structured JSON input or rendered transcript.
 */
export function agentTranscript(transcript, options = {}) {
	if (options.profile === profiles.JSON) {
		return transcript;
	}

	if (!isRecord(transcript)) {
		return "";
	}

	const entries = normaliseEntries(transcript.entries);
	const title = isNonEmptyString(transcript.title) ? transcript.title : defaultTitle;

	if (entries.length === 0) {
		return renderTitle(title, options);
	}

	return [
		renderTitle(title, options),
		...entries.map((entry) => renderEntry(entry, options)),
	].join("\n\n");
}

/**
 * Return transcript entries with usable content.
 *
 * @param  {*}  entries
 *     Entries to normalise.
 * @returns  {object[]}
 *     Valid transcript entries.
 */
function normaliseEntries(entries) {
	if (!Array.isArray(entries)) {
		return [];
	}

	return entries
		.filter(isRecord)
		.map((entry) => ({
			...entry,
			content: normaliseContent(entry.content),
		}))
		.filter((entry) => entry.content.length > 0);
}

/**
 * Return transcript content as non-empty lines.
 *
 * @param  {*}  content
 *     Entry content.
 * @returns  {string[]}
 *     Content lines.
 */
function normaliseContent(content) {
	if (isNonEmptyString(content)) {
		return content.split("\n").filter(isNonEmptyString);
	}

	return normaliseStringList(content);
}

/**
 * Render one transcript entry for the active profile.
 *
 * @param  {object}  entry
 *     Transcript entry.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered transcript entry.
 */
function renderEntry(entry, options) {
	const role = transcriptRoles[entry.role] ?? fallbackRole;
	const label = formatRoleLabel(role.label, entry.name);

	if (options.profile === profiles.AGENT) {
		return renderAgentEntry(label, entry.content, entry.role);
	}

	const renderedLabel = chip(label, role.tone, options);

	if (entry.content.length === 1) {
		return `${renderedLabel} ${entry.content[0]}`;
	}

	return [
		renderedLabel,
		...entry.content.map((line) => `  ${line}`),
	].join("\n");
}

/**
 * Render one Markdown transcript entry.
 *
 * @param  {string}  label
 *     Entry role label.
 * @param  {string[]}  content
 *     Entry content lines.
 * @param  {string}  role
 *     Machine-facing entry role.
 * @returns  {string}
 *     Markdown transcript entry.
 */
function renderAgentEntry(label, content, role) {
	if (role === "tool") {
		return [
			`## ${label}`,
			"```text",
			...content,
			"```",
		].join("\n");
	}

	return [`## ${label}`, ...content].join("\n");
}

/**
 * Add a source name to a role label when provided.
 *
 * @param  {string}  label
 *     Base role label.
 * @param  {*}  name
 *     Optional source name.
 * @returns  {string}
 *     Complete role label.
 */
function formatRoleLabel(label, name) {
	return isNonEmptyString(name) ? `${label}: ${name}` : label;
}
