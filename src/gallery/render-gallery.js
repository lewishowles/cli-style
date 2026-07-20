import { agentTranscript } from "../patterns/agent-transcript.js";
import { auditFinding } from "../patterns/audit-finding.js";
import { commandResult } from "../patterns/command-result.js";
import { compactDataTable } from "../patterns/compact-data-table.js";
import { confirmationResult } from "../patterns/confirmation-result.js";
import { diagnosticReport } from "../patterns/diagnostic-report.js";
import { diffBlock } from "../patterns/diff-block.js";
import { nextStepBlock } from "../patterns/next-step-block.js";
import { taskSummary } from "../patterns/task-summary.js";
import { stripAnsi } from "../formatters/ansi.js";
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
import { step, stepProgress, stepStates } from "../primitives/step-progress.js";
import { table } from "../primitives/table.js";
import { createReporter } from "../reporters/create-reporter.js";
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
		detail: "tone: info",
		resultType: resultTypes.INFO,
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
		resultType: resultTypes.UNCHANGED,
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
const panelToneExamples = ["info", "success", "warning", "danger"];

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

// Gallery variants available through the public renderer and CLI.
export const galleryVariants = ["current", "no-colour", "no-unicode", "plain"];

// Gallery sections available for focused output.
export const gallerySections = ["primitives", "patterns"];

// Fixtures available for focused output and interactive search.
export const galleryFixtures = [
	"diagnostic-report",
	"reporter",
	"command-result",
	"task-summary",
	"agent-transcript",
	"audit-finding",
	"compact-data-table",
	"compact-data-table-narrow",
	"confirmation-result",
	"next-step-block",
	"diff-block",
	"sparkline",
];

/**
 * Render the read-only style gallery.
 *
 * @param  {object}  options
 *     Rendering options.
 * @param  {object}  request
 *     Gallery selection request.
 * @returns  {string}
 *     Gallery output.
 */
export function renderGallery(options = {}, request = {}) {
	const galleryOptions =
		request.width === undefined
			? options
			: {
					...galleryWidthOptions(request.width),
					...options,
					width: request.width,
				};

	const variants =
		request.variants === true || request.matrix === true
			? galleryVariants
			: [request.variant ?? "current"];

	const output = [
		"CLI style gallery",
		...variants.flatMap((variant) => ["", renderVariant(variant, galleryOptions, request)]),
	].join("\n");

	return request.width === undefined ? output : clampGalleryOutput(output, request.width);
}

/**
 * Render one gallery capability variant.
 *
 * @param  {string}  variant
 *     Variant name.
 * @param  {object}  options
 *     Rendering options.
 * @param  {object}  request
 *     Gallery selection request.
 * @returns  {string}
 *     Variant gallery output.
 */
function renderVariant(variant, options, request) {
	const resolvedVariant = resolveVariant(variant, options);
	const sections = [];

	if (request.fixture !== undefined) {
		sections.push(
			request.fixture === "sparkline"
				? renderSparklineFixture(resolvedVariant.options)
				: renderPatterns(resolvedVariant.options, request.fixture),
		);
	} else {
		if (request.section === undefined || request.section === "primitives") {
			sections.push(renderPrimitives(resolvedVariant.options));
		}

		if (request.section === undefined || request.section === "patterns") {
			sections.push(renderPatterns(resolvedVariant.options));
		}
	}

	return [
		divider({
			...resolvedVariant.options,
			label: resolvedVariant.title,
		}),
		"",
		...joinSections(sections),
	].join("\n");
}

/**
 * Resolve one gallery variant title and rendering options.
 *
 * @param  {string}  variant
 *     Variant name.
 * @param  {object}  options
 *     Base rendering options.
 * @returns  {object}
 *     Variant title and options.
 */
function resolveVariant(variant, options) {
	if (variant === "no-colour") {
		return {
			options: {
				...options,
				colour: false,
			},
			title: "No colour",
		};
	}

	if (variant === "no-unicode") {
		return {
			options: {
				...options,
				unicode: false,
			},
			title: "No Unicode",
		};
	}

	if (variant === "plain") {
		return {
			options: {
				...options,
				colour: false,
				unicode: false,
			},
			title: "Plain",
		};
	}

	return {
		options,
		title: "Current terminal",
	};
}

/**
 * Add spacing between non-empty gallery sections.
 *
 * @param  {string[]}  sections
 *     Gallery sections.
 * @returns  {string[]}
 *     Sections with blank-line separators.
 */
function joinSections(sections) {
	return sections.flatMap((section, index) => (index === 0 ? [section] : ["", section]));
}

/**
 * Return component widths derived from a gallery width request.
 *
 * @param  {number}  width
 *     Requested gallery width.
 * @returns  {object}
 *     Width options for fixed-width renderers.
 */
function galleryWidthOptions(width) {
	return {
		barWidth: Math.max(width - 18, 1),
		dividerWidth: width,
		panelWidth: width,
	};
}

/**
 * Keep generated gallery lines inside a requested visible width.
 *
 * @param  {string}  output
 *     Gallery output.
 * @param  {number}  width
 *     Requested visible width.
 * @returns  {string}
 *     Width-constrained output.
 */
function clampGalleryOutput(output, width) {
	return output
		.split("\n")
		.map((line) => clampLine(line, width))
		.join("\n");
}

/**
 * Truncate one line to a visible width.
 *
 * @param  {string}  line
 *     Output line.
 * @param  {number}  width
 *     Requested visible width.
 * @returns  {string}
 *     Truncated line.
 */
function clampLine(line, width) {
	const plainLine = stripAnsi(line);

	if (plainLine.length <= width) {
		return line;
	}

	if (width <= 1) {
		return plainLine.slice(0, width);
	}

	return `${plainLine.slice(0, width - 1)}~`;
}

/**
 * Render composed output pattern examples.
 *
 * @param  {object}  options
 *     Rendering options.
 * @param  {string}  fixture
 *     Optional fixture name.
 * @returns  {string}
 *     Pattern gallery output.
 */
function renderPatterns(options, fixture) {
	const audit = auditFinding(
		{
			evidence: ["Text contrast measures 3.2:1", "Body text requires at least 4.5:1"],
			finding: "Muted text has insufficient contrast",
			location: "src/components/StatusCard.vue:42",
			recommendation: "Use the standard foreground token.",
			references: ["WCAG 2.2 SC 1.4.3"],
			result: resultTypes.FAILED,
			title: "Accessibility audit",
		},
		options,
	);

	const compactTableData = {
		columns: [
			{
				key: "package",
				label: "Package",
			},
			{
				key: "status",
				label: "Status",
			},
			{
				key: "version",
				label: "Version",
			},
		],
		rows: [
			{
				package: "components",
				status: "minor",
				version: "2.8.0",
			},
			{
				package: "helpers",
				status: "current",
				version: "4.1.0",
			},
		],
		summary: "2 packages checked",
		title: "Package updates",
	};

	const compactTable = compactDataTable(compactTableData, options);

	const narrowCompactTable = compactDataTable(compactTableData, {
		...options,
		width: 20,
	});

	const confirmation = confirmationResult(
		{
			action: "Delete project",
			detail: "Project and 12 files removed.",
			item: "Website refresh",
			state: "confirmed",
		},
		options,
	);

	const command = commandResult(
		{
			command: "bun run test:unit",
			details: ["121 tests passed", "Log saved to .agent/diagnostics/test-unit.log"],
			duration: "158 ms",
			exitCode: 0,
			result: resultTypes.SUCCESS,
			summary: "Unit tests passed",
			title: "Unit test command",
		},
		options,
	);

	const report = diagnosticReport(
		{
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
			nextActions: ["Review failing checks", "Re-run diagnostics"],
			skippedChecks: [
				{
					name: "e2e",
					reason: "Browser unavailable",
				},
			],
			title: "Project diagnostics",
		},
		options,
	);

	const diff = diffBlock(
		{
			lines: [
				{
					text: "render()",
					type: "header",
				},
				{
					text: "return nextStep;",
					type: "added",
				},
				{
					text: "return currentStep;",
					type: "removed",
				},
				{
					text: "const currentStep = getStep();",
					type: "context",
				},
			],
			path: "src/render.js",
			title: "Renderer change",
		},
		options,
	);

	const reporter = createReporter(options);

	reporter.divider("Project setup", "Claude + Codex");
	reporter.group(
		"Project files",
		[
			{
				detail: "already exists",
				label: "AGENTS.md",
				result: resultTypes.UNCHANGED,
			},
			{
				detail: "already exists",
				label: "WORKSPACE.md",
				result: resultTypes.UNCHANGED,
			},
		],
		{
			summary: "2 already present",
		},
	);
	reporter.group(
		"Agent scripts",
		[
			{
				detail: "already linked",
				label: "project-diagnostics.py",
				result: resultTypes.UNCHANGED,
			},
			{
				detail: "already linked",
				label: "generated-file-guard.py",
				result: resultTypes.UNCHANGED,
			},
			{
				detail: "already linked",
				label: "repo-context.py",
				result: resultTypes.UNCHANGED,
			},
			{
				detail: "already linked",
				label: "change-impact.py",
				result: resultTypes.UNCHANGED,
			},
		],
		{
			summary: "4 already linked",
		},
	);
	reporter.group(
		"Claude files",
		[
			{
				detail: "already exists",
				label: ".claude/",
				result: resultTypes.UNCHANGED,
			},
			{
				detail: "already up to date",
				label: ".claude/.claudeignore",
				result: resultTypes.UNCHANGED,
			},
		],
		{
			summary: "2 already current",
		},
	);
	reporter.status(resultTypes.SUCCESS, "Done.");

	const reporterOutput = reporter.render();

	const nextStep = nextStepBlock(
		{
			alternatives: ["Review the focused gallery fixture"],
			commands: ["git status --short", "bun run test:unit"],
			next: "Commit the completed pattern chunk",
			reason: "Implementation and verification are complete.",
		},
		options,
	);

	const summary = taskSummary(
		{
			completed: ["Added command result renderer", "Added task summary renderer"],
			remaining: ["Review gallery output"],
			result: resultTypes.PARTIAL,
			summary: "Implementation complete",
			task: "Add command and task patterns",
			title: "Pattern implementation",
		},
		options,
	);

	const transcript = agentTranscript(
		{
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
					content: ["128 tests passed", "0 tests failed"],
					name: "project-diagnostics",
					role: "tool",
				},
				{
					content: "Tests pass. Nothing remains.",
					role: "agent",
				},
			],
			title: "Focused verification",
		},
		options,
	);

	const fixtures = {
		"agent-transcript": ["Agent transcript", transcript],
		"audit-finding": ["Audit finding", audit],
		"command-result": ["Command result", command],
		"compact-data-table": ["Compact data table", compactTable],
		"compact-data-table-narrow": ["Compact data table (narrow)", narrowCompactTable],
		"confirmation-result": ["Confirmation result", confirmation],
		"diagnostic-report": ["Diagnostic report", report],
		"diff-block": ["Diff block", diff],
		"next-step-block": ["Next-step block", nextStep],
		reporter: ["Reporter", reporterOutput],
		"task-summary": ["Task summary", summary],
	};

	if (fixture !== undefined) {
		return renderPatternFixture(fixtures[fixture], options);
	}

	return [
		divider({
			...options,
			label: "Patterns",
		}),
		"",
		"Diagnostic report",
		frameExample(report, options),
		"",
		"Reporter",
		frameExample(reporterOutput, options),
		"",
		"Command result",
		frameExample(command, options),
		"",
		"Task summary",
		frameExample(summary, options),
		"",
		"Agent transcript",
		frameExample(transcript, options),
		"",
		"Audit finding",
		frameExample(audit, options),
		"",
		"Diff block",
		frameExample(diff, options),
		"",
		"Compact data table",
		frameExample(compactTable, options),
		"",
		"Compact data table (narrow)",
		frameExample(narrowCompactTable, options),
		"",
		"Confirmation result",
		frameExample(confirmation, options),
		"",
		"Next-step block",
		frameExample(nextStep, options),
	].join("\n");
}

/**
 * Render one named pattern fixture.
 *
 * @param  {string[]}  fixture
 *     Fixture label and output.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Framed fixture output.
 */
function renderPatternFixture(fixture, options) {
	return [fixture[0], frameExample(fixture[1], options)].join("\n");
}

/**
 * Render the focused sparkline fixture.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Framed sparkline fixture output.
 */
function renderSparklineFixture(options) {
	return ["Sparkline", frameExample(renderSparklineExample(options), options)].join("\n");
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
		.map((line) => (line === "" ? rail : `${rail} ${line}`))
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
		"Sparklines",
		renderSparklineExample(options),
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
		hint(`Run ${span("npm run docs:readme", "info", options)}`, options),
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
		row("Bundle", "is 22.3 KB, above the 12.0 KB budget", {
			...options,
			labelWidth: 8,
			result: resultTypes.FAILED,
		}),
		"",
		"Row groups",
		rowGroup({
			...options,
			rows: [
				{
					label: "Package",
					value: "@lewishowles/components",
				},
				{
					label: "Version",
					value: "minor: 2.7.4 -> 2.8.0",
				},
				{
					label: "Checks",
					value: "type-check, unit, build",
				},
				{
					label: "Bundle",
					result: resultTypes.FAILED,
					value: "is 22.3 KB, above the 12.0 KB budget",
				},
			],
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
 * Render representative sparkline sequences.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Sparkline examples.
 */
function renderSparklineExample(options) {
	const examples = [
		{
			label: "Rising",
			tone: "success",
			values: [1, 2, 3, 4, 5, 6],
		},
		{
			label: "Falling",
			tone: "danger",
			values: [6, 5, 4, 3, 2, 1],
		},
		{
			label: "Flat",
			tone: "info",
			values: [4, 4, 4, 4, 4, 4],
		},
		{
			label: "Negative",
			tone: "warning",
			values: [-6, -4, -5, -2, -3, -1],
		},
		{
			label: "Narrow mixed",
			tone: "info",
			values: [0, 10, -5, 5, 2, 8, -2],
			width: 4,
		},
	];

	return examples
		.map((example) =>
			sparkline({
				...options,
				...example,
				width: example.width ?? 16,
			}),
		)
		.join("\n");
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
	return progressExamples.map((example) =>
		progressBar({
			...options,
			max: 100,
			tone: example.tone,
			value: example.value,
		}),
	);
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
	return panelToneExamples.map((tone) =>
		panel({
			...options,
			lines: [`tone: ${tone}`],
			title: tone,
			tone,
		}),
	);
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
