import { profiles } from "../profiles/profiles.js";
import { row } from "../primitives/row.js";
import {
	isNonEmptyString,
	isRecord,
	normaliseStringList,
	renderSection,
	renderTitle,
} from "./helpers.js";

// Next-step blocks use a stable title when the caller does not provide one.
const defaultTitle = "Next step";

/**
 * Render the first concrete follow-up action and supporting context.
 *
 * @param  {object}  nextStep
 *     Structured next-step block.
 * @param  {string[]}  nextStep.alternatives
 *     Secondary actions.
 * @param  {string[]}  nextStep.commands
 *     Commands needed for the action.
 * @param  {string}  nextStep.next
 *     Primary next action.
 * @param  {string}  nextStep.reason
 *     Why the action is next.
 * @param  {string}  nextStep.title
 *     Pattern title.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {object|string}
 *     Structured JSON input or rendered next-step block.
 */
export function nextStepBlock(nextStep, options = {}) {
	if (options.profile === profiles.JSON) {
		return nextStep;
	}

	if (!isRecord(nextStep)) {
		return "";
	}

	const title = isNonEmptyString(nextStep.title) ? nextStep.title : defaultTitle;
	const next = renderNext(nextStep.next, options);
	const reason = isNonEmptyString(nextStep.reason)
		? renderSection("Why", [nextStep.reason], options, false)
		: "";
	const commands = renderCommands(nextStep.commands, options);
	const alternatives = normaliseStringList(nextStep.alternatives)
		.map((alternative) => `- ${alternative}`);
	const sections = [
		next,
		reason,
		commands,
		renderSection("Alternatives", alternatives, options, false),
	].filter((section) => section !== "");

	return [renderTitle(title, options), ...sections].join("\n\n");
}

/**
 * Render the primary next action.
 *
 * @param  {*}  next
 *     Primary next action.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered next action.
 */
function renderNext(next, options) {
	if (!isNonEmptyString(next)) {
		return "";
	}

	if (options.profile === profiles.AGENT) {
		return renderSection("Next", [next], options, false);
	}

	return row("Next", next, {
		...options,
		labelWidth: 4,
	});
}

/**
 * Render commands as shell text.
 *
 * @param  {*}  commands
 *     Commands to render.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered commands.
 */
function renderCommands(commands, options) {
	const validCommands = normaliseStringList(commands);

	if (validCommands.length === 0) {
		return "";
	}

	if (options.profile === profiles.AGENT) {
		return [
			"## Commands",
			"```sh",
			...validCommands,
			"```",
		].join("\n");
	}

	return renderSection(
		"Commands",
		validCommands.map((command) => `$ ${command}`),
		options,
		false,
	);
}
