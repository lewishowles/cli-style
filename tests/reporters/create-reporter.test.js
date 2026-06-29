import { describe, expect, test } from "bun:test";

import {
	createReporter,
	renderGroup,
	renderReporterStatus,
	renderSection,
	resultTypes,
} from "../../src/index.js";

describe("Render contracts", () => {
	test("Renders section headings through info status", () => {
		expect(renderSection("Setting up Claude", "(global)", {
			colour: false,
		})).toBe("→ Setting up Claude (global)");
	});

	test("Renders status rows with caller labels", () => {
		expect(renderReporterStatus("success", "Done.", "", {
			colour: false,
		})).toBe("✓ Done.");
	});

	test("Summarises grouped rows by result", () => {
		const output = renderGroup("Skills", [
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
		], {
			colour: false,
		});

		expect(output).toBe("– Skills 1 skipped, 2 unchanged");
	});

	test("Uses custom group summaries", () => {
		const output = renderGroup("Skills", [
			{
				label: "skills/accessibility",
				result: resultTypes.UNCHANGED,
			},
		], {
			colour: false,
			summary: "42 already linked, 1 skipped",
		});

		expect(output).toBe("↪ Skills 42 already linked, 1 skipped");
	});

	test("Includes detail rows when verbose", () => {
		const output = renderGroup("Project files", [
			{
				detail: "already exists",
				label: "AGENTS.md",
				result: resultTypes.UNCHANGED,
			},
		], {
			colour: false,
			verbose: true,
		});

		expect(output).toBe("↪ Project files 1 unchanged\n  ↪ AGENTS.md already exists");
	});

	test("Collects reporter lines", () => {
		const reporter = createReporter({
			colour: false,
		});

		reporter.section("Setting up Claude + Codex", "(project)");
		reporter.group("Agent scripts", [
			{
				label: "project-diagnostics.py",
				result: resultTypes.UNCHANGED,
			},
		], {
			summary: "4 already linked",
		});
		reporter.status("success", "Done.");

		expect(reporter.render()).toBe([
			"→ Setting up Claude + Codex (project)",
			"↪ Agent scripts 4 already linked",
			"✓ Done.",
		].join("\n"));
	});
});
