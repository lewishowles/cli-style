import { agentTranscript } from "../patterns/agent-transcript.js";
import { auditFinding } from "../patterns/audit-finding.js";
import { commandResult } from "../patterns/command-result.js";
import { compactDataTable } from "../patterns/compact-data-table.js";
import { confirmationResult } from "../patterns/confirmation-result.js";
import { diagnosticReport } from "../patterns/diagnostic-report.js";
import { nextStepBlock } from "../patterns/next-step-block.js";
import { taskSummary } from "../patterns/task-summary.js";
import { barChart } from "../primitives/bar-chart.js";
import { chip } from "../primitives/chip.js";
import { divider } from "../primitives/divider.js";
import { emptyState, errorBlock, hint } from "../primitives/feedback.js";
import { panel } from "../primitives/panel.js";
import { progressBar } from "../primitives/progress-bar.js";
import { row } from "../primitives/row.js";
import { rowGroup } from "../primitives/row-group.js";
import { sparkline } from "../primitives/sparkline.js";
import { span } from "../primitives/span.js";
import { status } from "../primitives/status.js";
import { step, stepProgress } from "../primitives/step-progress.js";
import { table } from "../primitives/table.js";
import { isProfile, profiles } from "../profiles/profiles.js";
export { rendererNames } from "../catalogue/renderer-catalogue.js";

// Renderer names accepted by the custom-input render command.
const renderers = {
	"agent-transcript": (input, options) => agentTranscript(input, options),
	"audit-finding": (input, options) => auditFinding(input, options),
	"bar-chart": (input, options) =>
		barChart({
			...input,
			...options,
		}),
	chip: (input, options) =>
		chip(input.label, input.tone, {
			...input,
			...options,
		}),
	"command-result": (input, options) => commandResult(input, options),
	"compact-data-table": (input, options) => compactDataTable(input, options),
	"confirmation-result": (input, options) => confirmationResult(input, options),
	"diagnostic-report": (input, options) => diagnosticReport(input, options),
	divider: (input, options) =>
		divider({
			...input,
			...options,
		}),
	"empty-state": (input, options) =>
		emptyState(input.title, input.detail, {
			...input,
			...options,
		}),
	"error-block": (input, options) =>
		errorBlock(input.title, input.lines, {
			...input,
			...options,
		}),
	hint: (input, options) =>
		hint(input.message, {
			...input,
			...options,
		}),
	"next-step-block": (input, options) => nextStepBlock(input, options),
	panel: (input, options) =>
		panel({
			...input,
			...options,
		}),
	"progress-bar": (input, options) =>
		progressBar({
			...input,
			...options,
		}),
	row: (input, options) =>
		row(input.label, input.value, {
			...input,
			...options,
		}),
	"row-group": (input, options) =>
		rowGroup({
			...input,
			...options,
		}),
	sparkline: (input, options) =>
		sparkline({
			...input,
			...options,
		}),
	span: (input, options) =>
		span(input.value, input.tone, {
			...input,
			...options,
		}),
	status: (input, options) =>
		status(input.type, input.detail, {
			...input,
			...options,
		}),
	step: (input, options) =>
		step(input.label, input.state, {
			...input,
			...options,
		}),
	"step-progress": (input, options) =>
		stepProgress({
			...input,
			...options,
		}),
	table: (input, options) =>
		table({
			...input,
			...options,
		}),
	"task-summary": (input, options) => taskSummary(input, options),
};

// Global rendering flags accepted after `render <renderer>`.
const globalRenderingFlags = new Set([
	"--dark",
	"--light",
	"--no-color",
	"--no-colour",
	"--no-unicode",
	"--plain",
]);

// Renderer names exposed for help text and tests.

/**
 * Parse render command arguments.
 *
 * @param  {string[]}  args
 *     Arguments after the render command.
 * @returns  {object}
 *     Render request.
 */
export function parseRenderRequest(args = []) {
	const request = {
		renderer: undefined,
		width: undefined,
	};

	for (let index = 0; index < args.length; index += 1) {
		const argument = args[index];

		if (argument === "--profile") {
			validateRenderProfile(readOptionValue(args, index, argument));
			index += 1;
		} else if (argument.startsWith("--profile=")) {
			validateRenderProfile(readInlineOptionValue(argument, "--profile"));
		} else if (argument === "--width") {
			request.width = readWidthValue(readOptionValue(args, index, argument));
			index += 1;
		} else if (argument.startsWith("--width=")) {
			request.width = readWidthValue(readInlineOptionValue(argument, "--width"));
		} else if (argument === "--json") {
			throw new Error("Render does not support json output");
		} else if (globalRenderingFlags.has(argument)) {
			// Accepted here because createCliStyle() has already resolved these flags.
		} else if (argument.startsWith("-")) {
			throw new Error(`Unknown render option: ${argument}`);
		} else if (request.renderer !== undefined) {
			throw new Error(`Unexpected render argument: ${argument}`);
		} else {
			request.renderer = argument;
		}
	}

	validateRequest(request);

	return request;
}

/**
 * Render caller-provided JSON through a named renderer.
 *
 * @param  {string}  json
 *     JSON input from stdin.
 * @param  {object}  request
 *     Parsed render request.
 * @param  {object}  options
 *     Resolved render options.
 * @returns  {string}
 *     Rendered text.
 */
export function renderJsonInput(json, request, options = {}) {
	if (options.profile === profiles.JSON) {
		throw new Error("Render does not support json output");
	}

	const input = parseJsonObject(json);
	const renderer = renderers[request.renderer];

	return renderer(input, {
		...options,
		width: request.width ?? options.width,
	});
}

/**
 * Read a required inline option value.
 *
 * @param  {string}  argument
 *     Full `--option=value` argument.
 * @param  {string}  option
 *     Option name.
 * @returns  {string}
 *     Option value.
 */
function readInlineOptionValue(argument, option) {
	const value = argument.slice(`${option}=`.length);

	if (value === "") {
		throw new Error(`Missing value for ${option}`);
	}

	return value;
}

/**
 * Read a required option value.
 *
 * @param  {string[]}  args
 *     Command arguments.
 * @param  {number}  index
 *     Option index.
 * @param  {string}  option
 *     Option name.
 * @returns  {string}
 *     Option value.
 */
function readOptionValue(args, index, option) {
	const value = args[index + 1];

	if (value === undefined || value.startsWith("-")) {
		throw new Error(`Missing value for ${option}`);
	}

	return value;
}

/**
 * Parse a render width option.
 *
 * @param  {string}  value
 *     Width argument value.
 * @returns  {number}
 *     Positive integer width.
 */
function readWidthValue(value) {
	const width = Number(value);

	if (!Number.isInteger(width) || width <= 0) {
		throw new Error("Render width must be a positive integer");
	}

	return width;
}

/**
 * Validate a render text profile.
 *
 * @param  {string}  profile
 *     Requested output profile.
 * @returns  {void}
 */
function validateRenderProfile(profile) {
	if (!isProfile(profile)) {
		throw new Error(`Unknown profile: ${profile}`);
	}

	if (profile === profiles.JSON) {
		throw new Error("Render does not support json output");
	}
}

/**
 * Validate render request values.
 *
 * @param  {object}  request
 *     Parsed render request.
 * @returns  {void}
 */
function validateRequest(request) {
	if (request.renderer === undefined) {
		throw new Error("Missing renderer");
	}

	if (!Object.hasOwn(renderers, request.renderer)) {
		throw new Error(`Unknown renderer: ${request.renderer}`);
	}
}

/**
 * Parse JSON stdin into an object accepted by renderers.
 *
 * @param  {string}  json
 *     JSON input.
 * @returns  {object}
 *     Parsed input object.
 */
function parseJsonObject(json) {
	let input;

	try {
		input = JSON.parse(json);
	} catch {
		throw new Error("Render input must be valid JSON");
	}

	if (input === null || Array.isArray(input) || typeof input !== "object") {
		throw new Error("Render input must be a JSON object");
	}

	return input;
}
