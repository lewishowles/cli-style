import { describe, expect, test } from "bun:test";

import {
	barChart,
	createCliStyle,
	diagnosticReport,
	divider,
	emptyState,
	errorBlock,
	hint,
	panel,
	profiles,
	progressBar,
	renderGallery,
	renderHelp,
	step,
	stepProgress,
	stripAnsi,
	table,
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
});

describe("Render contracts", () => {
	test("Renders CLI help as a string", () => {
		const output = renderHelp();

		expect(output).toContain("Usage:");
		expect(output).toContain("cli-style gallery");
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

	test("Renders primitive gallery as a string", () => {
		const output = renderGallery();

		expect(output).toContain("CLI style gallery");
		expect(output).toContain("Current terminal -----------------------");
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
		expect(output).toContain("Patterns");
		expect(output).toContain("Diagnostic report");
		expect(output).toContain("Coverage below target");
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
		expect(stripAnsi(output)).toContain("OK Success tone: success");
	});
});
