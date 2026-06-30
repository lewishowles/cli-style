import { describe, expect, test } from "bun:test";

import {
	agentTranscript,
	auditFinding,
	barChart,
	commandResult,
	compactDataTable,
	confirmationResult,
	createCliStyle,
	createReporter,
	diagnosticReport,
	divider,
	emptyState,
	errorBlock,
	hint,
	nextStepBlock,
	panel,
	profiles,
	progressBar,
	renderGallery,
	renderHelp,
	renderGroup,
	renderReporterDivider,
	step,
	stepProgress,
	stripAnsi,
	table,
	taskSummary,
} from "../src/index.js";

describe("Initialisation", () => {
	test("Creates a renderer with default options", () => {
		const ui = createCliStyle();

		expect(ui.options).toEqual({
			colour: false,
			isCi: false,
			isDumb: false,
			isTty: false,
			profile: profiles.HUMAN,
			unicode: true,
			width: 80,
		});
	});

	test("Resolves profile and terminal capabilities from inputs", () => {
		const ui = createCliStyle({
			env: {
				CI: "true",
			},
			stdout: {
				columns: 120,
				isTTY: true,
			},
		});

		expect(ui.options.profile).toBe(profiles.CI);
		expect(ui.options.colour).toBe(true);
		expect(ui.options.isCi).toBe(true);
		expect(ui.options.width).toBe(120);
	});

	test("Allows resolved capability options to be overridden", () => {
		const ui = createCliStyle({
			colour: false,
			stdout: {
				isTTY: true,
			},
			unicode: false,
			width: 64,
		});

		expect(ui.options.colour).toBe(false);
		expect(ui.options.unicode).toBe(false);
		expect(ui.options.width).toBe(64);
	});

	test("Creates reporters with resolved options", () => {
		const ui = createCliStyle({
			colour: false,
			unicode: false,
		});
		const reporter = ui.reporter();

		expect(reporter.status("info", "Checking")).toBe("> Checking");
	});
});

describe("Render contracts", () => {
	test("Renders CLI help as a string", () => {
		const output = renderHelp();

		expect(output).toContain("Usage:");
		expect(output).toContain("cli-style gallery");
		expect(output).toContain("cli-style render");
	});

	test("Exports divider primitive", () => {
		expect(divider({
			colour: false,
			dividerWidth: 4,
		})).toBe("----");
	});

	test("Exports panel primitive", () => {
		expect(panel({
			colour: false,
			lines: ["Ready"],
			panelWidth: 12,
			title: "Status",
		})).toBe("▌           \n▌  Status   \n▌  Ready    \n▌           ");
	});

	test("Exports progress bar primitive", () => {
		expect(progressBar({
			barWidth: 4,
			colour: false,
			max: 4,
			value: 2,
		})).toBe("[██░░] 50% (2/4)");
	});

	test("Exports bar chart primitive", () => {
		expect(barChart({
			barWidth: 4,
			colour: false,
			rows: [
				{
					label: "Items",
					value: 2,
				},
			],
		})).toBe("Items  ████ 2");
	});

	test("Exports table primitive", () => {
		expect(table({
			colour: false,
			columns: [
				{
					key: "name",
					label: "Name",
				},
			],
			rows: [
				{
					name: "Build",
				},
			],
		})).toBe("Name\n─────\nBuild");
	});

	test("Exports feedback primitives", () => {
		expect(hint("Review output.", {
			colour: false,
		})).toBe("i Hint: Review output.");
		expect(emptyState("No results", "", {
			colour: false,
		})).toBe("– No results");
		expect(errorBlock("Failed", ["Stopped"], {
			colour: false,
			profile: "ci",
			unicode: false,
		})).toBe("x Error: Failed\nStopped");
	});

	test("Exports reporter helpers", () => {
		expect(createReporter({
			colour: false,
		}).status("success", "Done.")).toBe("✓ Done.");
		expect(renderGroup("Checks", [
			{
				result: "success",
				label: "unit",
			},
		], {
			colour: false,
		})).toBe("✓ Checks 1 success");
		expect(renderReporterDivider("Checks", "Unit tests", {
			colour: false,
			dividerWidth: 32,
		})).toBe("Checks · Unit tests ------------");
	});

	test("Exports diagnostic report pattern", () => {
		expect(diagnosticReport({
			checks: [
				{
					name: "unit",
					result: "success",
				},
			],
		}, {
			colour: false,
		})).toContain("✓ Success unit");
	});

	test("Exports command and task result patterns", () => {
		expect(commandResult({
			result: "success",
			summary: "Tests passed",
		}, {
			colour: false,
		})).toContain("✓ Success Tests passed");
		expect(taskSummary({
			result: "partial",
			task: "Add patterns",
		}, {
			colour: false,
		})).toContain("◐ Partial Add patterns");
	});

	test("Exports agent transcript pattern", () => {
		expect(agentTranscript({
			entries: [
				{
					content: "Tests pass.",
					role: "agent",
				},
			],
		}, {
			colour: false,
		})).toContain("[Agent] Tests pass.");
	});

	test("Exports audit finding pattern", () => {
		expect(auditFinding({
			finding: "Icon button is unnamed",
			result: "failed",
		}, {
			colour: false,
		})).toContain("× Failed Icon button is unnamed");
	});

	test("Exports compact data table pattern", () => {
		expect(compactDataTable({
			columns: [
				{
					key: "check",
					label: "Check",
				},
			],
			rows: [
				{
					check: "unit",
				},
			],
		}, {
			colour: false,
		})).toContain("unit");
	});

	test("Exports confirmation result pattern", () => {
		expect(confirmationResult({
			action: "Delete project",
			item: "Website refresh",
			state: "confirmed",
		}, {
			colour: false,
		})).toContain("✓ Confirmed Delete project — Website refresh");
	});

	test("Exports next-step block pattern", () => {
		expect(nextStepBlock({
			next: "Run verification",
		}, {
			colour: false,
		})).toContain("Next  Run verification");
	});

	test("Exports step primitives", () => {
		expect(step("Build", "current", {
			colour: false,
			unicode: false,
		})).toBe("... Build");
		expect(stepProgress({
			colour: false,
			current: 1,
			steps: ["Install", "Build"],
			unicode: false,
		})).toBe("1/2 OK Install\n2/2 ... Build");
	});

	test("Renders the current-terminal gallery by default", () => {
		const output = renderGallery();

		expect(output).toContain("CLI style gallery");
		expect(output).toContain("Current terminal -----------------------");
		expect(output).not.toContain("No colour ------------------------------");
		expect(output).not.toContain("No Unicode -----------------------------");
		expect(output).not.toContain("Plain ----------------------------------");
	});

	test("Renders all gallery variants on request", () => {
		const output = renderGallery({}, {
			variants: true,
		});

		expect(output).toContain("No colour ------------------------------");
		expect(output).toContain("No Unicode -----------------------------");
		expect(output).toContain("Plain ----------------------------------");
		expect(output).toContain("Primitives");
		expect(output).toContain("[neutral] [info] [success] [warning] [danger]");
		expect(output).toContain("✓ Success tone: success");
		expect(output).toContain("◐ Partial tone: warning");
		expect(output).toContain("– Skipped tone: muted");
		expect(output).toContain("? Unknown tone: muted");
		expect(output).toContain("OK Success tone: success");
		expect(output).toContain("- Skipped tone: muted");
		expect(output).toContain("▌  info");
		expect(output).toContain("|  tone: danger");
		expect(output).toContain("[--------------------] 0% (0/100)");
		expect(output).toContain("[##########----------] 50% (50/100)");
		expect(output).toContain("[####################] 100% (100/100)");
		expect(output).toContain("positive  #################### 10");
		expect(output).toContain("warning   ############         6");
		expect(output).toContain("negative  ######               -3");
		expect(output).toContain("Check       Result");
		expect(output).toContain("type-check  passed");
		expect(output).toContain("Check   type-check");
		expect(output).toContain("Result  warning");
		expect(output).toContain("i Hint: tone: info");
		expect(output).toContain("- No results tone: muted");
		expect(output).toContain("|  x Error: Failed");
		expect(output).toContain("OK complete");
		expect(output).toContain("... current");
		expect(output).toContain("1/3 OK complete");
		expect(output).toContain("2/3 ... current");
		expect(output).toContain("Package   @lewishowles/components");
		expect(output).toContain("Patterns -------------------------------");
		expect(output).toContain("Diagnostic report");
		expect(output).toContain("│ Project diagnostics");
		expect(output).toContain("│ Project setup · Claude + Codex ---------");
		expect(output).toContain("│ ↪ Project files 2 already present");
		expect(output).toContain("│ ↪ Agent scripts 4 already linked");
		expect(output).toContain("│ ↪ Claude files 2 already current");
		expect(output).toContain("| Project setup · Claude + Codex ---------");
		expect(output).toContain("| - Agent scripts 4 already linked");
		expect(output).toContain("│ ⚠ Warning Coverage below target");
		expect(output).toContain("│ Unit test command");
		expect(output).toContain("│ ✓ Success Unit tests passed");
		expect(output).toContain("│ Pattern implementation");
		expect(output).toContain("│ ◐ Partial Add command and task patterns");
		expect(output).toContain("│ Focused verification");
		expect(output).toContain("│ [Tool: project-diagnostics]");
		expect(output).toContain("│ Accessibility audit");
		expect(output).toContain("│ × Failed Muted text has insufficient contrast");
		expect(output).toContain("│ Package updates");
		expect(output).toContain("│ Package     Status   Version");
		expect(output).toContain("│ Package  components");
		expect(output).toContain("│ ✓ Confirmed Delete project — Website refresh");
		expect(output).toContain("│ Next  Commit the completed pattern chunk");
		expect(output).toContain("| [Tool: project-diagnostics]");
		expect(output).toContain("| x Failed Muted text has insufficient contrast");
		expect(output).toContain("| Project diagnostics");
		expect(output).toContain("| ! Warning Coverage below target");
	});

	test("Filters gallery variants, sections, and fixtures", () => {
		const noColour = renderGallery({
			colour: true,
		}, {
			variant: "no-colour",
		});
		const patterns = renderGallery({}, {
			section: "patterns",
		});
		const audit = renderGallery({}, {
			fixture: "audit-finding",
		});
		const confirmation = renderGallery({}, {
			fixture: "confirmation-result",
		});
		const nextStep = renderGallery({}, {
			fixture: "next-step-block",
		});
		const reporter = renderGallery({}, {
			fixture: "reporter",
		});

		expect(noColour).toContain("No colour ------------------------------");
		expect(noColour).not.toContain("\u001b[");
		expect(patterns).toContain("Patterns -------------------------------");
		expect(patterns).not.toContain("Primitives");
		expect(audit).toContain("Audit finding");
		expect(audit).toContain("Accessibility audit");
		expect(audit).not.toContain("Diagnostic report");
		expect(confirmation).toContain("✓ Confirmed Delete project — Website refresh");
		expect(confirmation).not.toContain("Audit finding");
		expect(nextStep).toContain("Next  Commit the completed pattern chunk");
		expect(nextStep).not.toContain("Confirmation result");
		expect(reporter).toContain("Reporter");
		expect(reporter).toContain("Project setup · Claude + Codex ---------");
		expect(reporter).not.toContain("Diagnostic report");
	});

	test("Renders gallery with a width override", () => {
		const output = renderGallery({}, {
			section: "primitives",
			width: 18,
		});

		expect(output).toContain("Check   type-check");
		expect(output).toContain("Result  warning");
	});

	test("Constrains gallery output to a requested width", () => {
		const output = renderGallery({}, {
			variants: true,
			width: 16,
		});
		const widestLine = Math.max(...stripAnsi(output).split("\n").map((line) => line.length));

		expect(widestLine).toBeLessThanOrEqual(16);
	});

	test("Renders coloured primitive gallery when colour is enabled", () => {
		const output = renderGallery({
			colour: true,
			unicode: true,
		});

		expect(output).toContain("\u001b[");
		expect(stripAnsi(output)).toContain(" neutral   info   success   warning   danger ");
		expect(stripAnsi(output)).toContain("✓ Success tone: success");
		expect(stripAnsi(output)).toContain("◐ Partial tone: warning");
		expect(stripAnsi(output)).not.toContain("OK Success tone: success");
	});
});
