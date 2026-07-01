import { describe, expect, test } from "bun:test";

import {
	createReporter,
	renderGroup,
	renderReporterDivider,
	renderReporterStatus,
	renderSection,
	resultTypes,
} from "../../src/index.js";

describe("Render contracts", () => {
	test("Renders section headings through info status", () => {
		expect(
			renderSection("Setting up Claude", "(global)", {
				colour: false,
			}),
		).toBe("→ Setting up Claude (global)");
	});

	test("Renders phase dividers", () => {
		expect(
			renderReporterDivider("External skills", "Sync upstream skills", {
				colour: false,
				dividerWidth: 48,
			}),
		).toBe("External skills · Sync upstream skills ---------");
	});

	test("Renders status rows with caller labels", () => {
		expect(
			renderReporterStatus("success", "Done.", "", {
				colour: false,
			}),
		).toBe("✓ Done.");
	});

	test("Summarises grouped rows by result", () => {
		const output = renderGroup(
			"Skills",
			[
				{
					label: "skills/accessibility",
					result: resultTypes.UNCHANGED,
				},
				{
					label: "skills/vue",
					result: resultTypes.UNCHANGED,
				},
				{
					label: "skills/global-rules",
					result: resultTypes.SKIPPED,
				},
			],
			{
				colour: false,
			},
		);

		expect(output).toBe("– Skills 1 skipped, 2 unchanged");
	});

	test("Surfaces skipped rows in mixed successful groups", () => {
		const output = renderGroup(
			"Skills",
			[
				{
					label: "skills/accessibility",
					result: resultTypes.SUCCESS,
				},
				{
					label: "skills/global-rules",
					result: resultTypes.SKIPPED,
				},
				{
					label: "skills/vue",
					result: resultTypes.UNCHANGED,
				},
			],
			{
				colour: false,
			},
		);

		expect(output).toBe("– Skills 1 skipped, 1 success, 1 unchanged");
	});

	test("Uses custom group summaries", () => {
		const output = renderGroup(
			"Skills",
			[
				{
					label: "skills/accessibility",
					result: resultTypes.UNCHANGED,
				},
			],
			{
				colour: false,
				summary: "42 already linked, 1 skipped",
			},
		);

		expect(output).toBe("↪ Skills 42 already linked, 1 skipped");
	});

	test("Includes detail rows when verbose", () => {
		const output = renderGroup(
			"Project files",
			[
				{
					detail: "already exists",
					label: "AGENTS.md",
					result: resultTypes.UNCHANGED,
				},
			],
			{
				colour: false,
				verbose: true,
			},
		);

		expect(output).toBe("↪ Project files 1 unchanged\n  ↪ AGENTS.md already exists");
	});

	test("Collects reporter lines", () => {
		const reporter = createReporter({
			colour: false,
		});

		reporter.divider("Project setup", "Claude + Codex");
		reporter.group(
			"Agent scripts",
			[
				{
					label: "project-diagnostics.py",
					result: resultTypes.UNCHANGED,
				},
			],
			{
				summary: "4 already linked",
			},
		);
		reporter.status("success", "Done.");

		expect(reporter.render()).toBe(
			[
				"Project setup · Claude + Codex ---------",
				"↪ Agent scripts 4 already linked",
				"✓ Done.",
			].join("\n"),
		);
	});
});
