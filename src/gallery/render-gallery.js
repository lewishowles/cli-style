import { agentTranscript } from "../patterns/agent-transcript.js";
import { commandResult } from "../patterns/command-result.js";
import { diagnosticReport } from "../patterns/diagnostic-report.js";
import { taskSummary } from "../patterns/task-summary.js";
import { barChart } from "../primitives/bar-chart.js";
import { chip } from "../primitives/chip.js";
import { divider } from "../primitives/divider.js";
import { emptyState, errorBlock, hint } from "../primitives/feedback.js";
import { panel } from "../primitives/panel.js";
import { progressBar } from "../primitives/progress-bar.js";
import { row } from "../primitives/row.js";
import { status } from "../primitives/status.js";
import { step, stepProgress, stepStates } from "../primitives/step-progress.js";
import { table } from "../primitives/table.js";
import { resultTypes } from "../theme/results.js";

// Chip tone examples should expose every configured pill colour.
const chipToneExamples = [
	{
		label: "neutral",
		tone: "neutral",
	},
	{
		label: "info",
		tone: "info",
	},
	{
		label: "success",
		tone: "success",
	},
	{
		label: "warning",
		tone: "warning",
	},
	{
		label: "danger",
		tone: "danger",
	},
];

// Status examples should expose every configured result tone and symbol.
const statusExamples = [
	{
		detail: "tone: success",
		resultType: resultTypes.SUCCESS,
	},
	{
		detail: "tone: warning",
		resultType: resultTypes.WARNING,
	},
	{
		detail: "tone: warning",
		resultType: resultTypes.PARTIAL,
	},
	{
		detail: "tone: muted",
		resultType: resultTypes.SKIPPED,
	},
	{
		detail: "tone: muted",
		resultType: resultTypes.UNKNOWN,
	},
	{
		detail: "tone: danger",
		resultType: resultTypes.FAILED,
	},
];

// Panel examples should expose every configured semantic accent.
const panelToneExamples = [
	"info",
	"success",
	"warning",
	"danger",
];

// Progress examples expose common completion states and semantic tones.
const progressExamples = [
	{
		tone: "info",
		value: 0,
	},
	{
		tone: "success",
		value: 25,
	},
	{
		tone: "warning",
		value: 50,
	},
	{
		tone: "danger",
		value: 75,
	},
	{
		tone: "success",
		value: 100,
	},
];

/**
 * Render the read-only style gallery.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Gallery output.
 */
export function renderGallery(options = {}) {
	return [
		"CLI style gallery",
		"",
		renderVariant("Current terminal", options),
		"",
		renderVariant("No colour", {
			...options,
			colour: false,
		}),
		"",
		renderVariant("No Unicode", {
			...options,
			unicode: false,
		}),
		"",
		renderVariant("Plain", {
			...options,
			colour: false,
			unicode: false,
		}),
	].join("\n");
}

/**
 * Render one gallery capability variant.
 *
 * @param  {string}  title
 *     Variant title.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Variant gallery output.
 */
function renderVariant(title, options) {
	return [
		divider({
			...options,
			label: title,
		}),
		"",
		renderPrimitives(options),
		"",
		renderPatterns(options),
	].join("\n");
}

/**
 * Render composed output pattern examples.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Pattern gallery output.
 */
function renderPatterns(options) {
	const command = commandResult({
		command: "bun run test:unit",
		details: [
			"121 tests passed",
			"Log saved to .agent/diagnostics/test-unit.log",
		],
		duration: "158 ms",
		exitCode: 0,
		result: resultTypes.SUCCESS,
		summary: "Unit tests passed",
		title: "Unit test command",
	}, options);
	const report = diagnosticReport({
		checks: [
			{
				detail: "184 tests",
				name: "unit",
				result: resultTypes.SUCCESS,
			},
			{
				detail: "2 failures",
				name: "type-check",
				result: resultTypes.FAILED,
			},
		],
		findings: [
			{
				message: "Coverage below target",
				result: resultTypes.WARNING,
			},
		],
		nextActions: [
			"Review failing checks",
			"Re-run diagnostics",
		],
		skippedChecks: [
			{
				name: "e2e",
				reason: "Browser unavailable",
			},
		],
		title: "Project diagnostics",
	}, options);
	const summary = taskSummary({
		completed: [
			"Added command result renderer",
			"Added task summary renderer",
		],
		remaining: [
			"Review gallery output",
		],
		result: resultTypes.PARTIAL,
		summary: "Implementation complete",
		task: "Add command and task patterns",
		title: "Pattern implementation",
	}, options);
	const transcript = agentTranscript({
		entries: [
			{
				content: "Run the focused unit tests.",
				role: "user",
			},
			{
				content: "Running project diagnostics.",
				role: "agent",
			},
			{
				content: [
					"128 tests passed",
					"0 tests failed",
				],
				name: "project-diagnostics",
				role: "tool",
			},
			{
				content: "Tests pass. Nothing remains.",
				role: "agent",
			},
		],
		title: "Focused verification",
	}, options);

	return [
		divider({
			...options,
			label: "Patterns",
		}),
		"",
		"Diagnostic report",
		frameExample(report, options),
		"",
		"Command result",
		frameExample(command, options),
		"",
		"Task summary",
		frameExample(summary, options),
		"",
		"Agent transcript",
		frameExample(transcript, options),
	].join("\n");
}

/**
 * Add gallery-only framing around one rendered example.
 *
 * @param  {string}  output
 *     Rendered example output.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Framed gallery example.
 */
function frameExample(output, options) {
	const rail = options.unicode === false ? "|" : "│";

	return output
		.split("\n")
		.map((line) => line === "" ? rail : `${rail} ${line}`)
		.join("\n");
}

/**
 * Render primitive examples.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Primitive gallery output.
 */
function renderPrimitives(options) {
	return [
		"Primitives",
		"",
		"Chips",
		renderChipExamples(options),
		"",
		"Statuses",
		...renderStatusExamples(options),
		"",
		"Panels",
		...renderPanelExamples(options),
		"",
		"Progress bars",
		...renderProgressExamples(options),
		"",
		"Bar charts",
		renderBarChartExample(options),
		"",
		"Tables",
		renderTableExample(options),
		"",
		"Narrow tables",
		renderTableExample({
			...options,
			width: 18,
		}),
		"",
		"Feedback",
		hint("tone: info", options),
		emptyState("No results", "tone: muted", options),
		errorBlock("Failed", ["tone: danger"], {
			...options,
			panelWidth: 40,
		}),
		"",
		"Steps",
		step("complete", stepStates.COMPLETE, options),
		step("current", stepStates.CURRENT, options),
		step("pending", stepStates.PENDING, options),
		step("failed", resultTypes.FAILED, options),
		"",
		"Step progress",
		stepProgress({
			...options,
			current: 1,
			steps: ["complete", "current", "pending"],
		}),
		"",
		"Rows",
		row("Package", "@lewishowles/components", {
			...options,
			labelWidth: 8,
		}),
		row("Version", "minor: 2.7.4 -> 2.8.0", {
			...options,
			labelWidth: 8,
		}),
		row("Checks", "type-check, unit, build", {
			...options,
			labelWidth: 8,
		}),
	].join("\n");
}

/**
 * Render wide or narrow table diagnostics.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Table example.
 */
function renderTableExample(options) {
	return table({
		...options,
		columns: [
			{
				key: "check",
				label: "Check",
			},
			{
				key: "result",
				label: "Result",
			},
		],
		rows: [
			{
				check: "type-check",
				result: "passed",
			},
			{
				check: "unit",
				result: "warning",
			},
		],
	});
}

/**
 * Render a chart that exposes positive, warning, and negative colours.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Bar chart example.
 */
function renderBarChartExample(options) {
	return barChart({
		...options,
		rows: [
			{
				label: "positive",
				value: 10,
			},
			{
				label: "warning",
				tone: "warning",
				value: 6,
			},
			{
				label: "negative",
				value: -3,
			},
		],
	});
}

/**
 * Render common progress values and tones.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string[]}
 *     Progress examples.
 */
function renderProgressExamples(options) {
	return progressExamples.map((example) => progressBar({
		...options,
		max: 100,
		tone: example.tone,
		value: example.value,
	}));
}

/**
 * Render all panel tone examples.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string[]}
 *     Panel examples.
 */
function renderPanelExamples(options) {
	return panelToneExamples.map((tone) => panel({
		...options,
		lines: [`tone: ${tone}`],
		title: tone,
		tone,
	}));
}

/**
 * Render all chip tone examples.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Chip examples.
 */
function renderChipExamples(options) {
	return chipToneExamples.map((example) => chip(example.label, example.tone, options)).join(" ");
}

/**
 * Render all status examples.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string[]}
 *     Status examples.
 */
function renderStatusExamples(options) {
	return statusExamples.map((example) => status(example.resultType, example.detail, options));
}
