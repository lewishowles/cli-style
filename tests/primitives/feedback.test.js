import { describe, expect, test } from "bun:test";

import { emptyState, errorBlock, hint, stripAnsi } from "../../src/index.js";

describe("Feedback primitives", () => {
	test("Renders a hint with an explicit label", () => {
		const output = hint("Run with --fix to apply changes.", {
			colour: false,
		});

		expect(output).toBe("i Hint: Run with --fix to apply changes.");
	});

	test("Renders an empty state with optional detail", () => {
		const output = emptyState("No matching packages", "Try a broader query.", {
			colour: false,
		});

		expect(output).toBe("– No matching packages Try a broader query.");
	});

	test("Uses ASCII symbols when Unicode is disabled", () => {
		const output = emptyState("No results", "", {
			colour: false,
			unicode: false,
		});

		expect(output).toBe("- No results");
	});

	test("Renders errors as danger panels", () => {
		const output = errorBlock("Configuration invalid", [
			"Missing required field: package",
		], {
			colour: false,
			panelWidth: 40,
		});

		expect(output).toBe([
			"▌                                       ",
			"▌  × Error: Configuration invalid       ",
			"▌  Missing required field: package      ",
			"▌                                       ",
		].join("\n"));
	});

	test("Keeps CI errors undecorated and grep-friendly", () => {
		const output = errorBlock("Configuration invalid", [
			"Missing required field: package",
		], {
			colour: false,
			profile: "ci",
			unicode: false,
		});

		expect(output).toBe([
			"x Error: Configuration invalid",
			"Missing required field: package",
		].join("\n"));
	});

	test("Uses safe defaults for omitted feedback content", () => {
		const hintOutput = hint();
		const errorOutput = errorBlock(undefined, "Invalid details", {
			colour: false,
			profile: "ci",
			unicode: false,
		});

		expect(hintOutput).toBe("i Hint: ");
		expect(errorOutput).toBe("x Error: Failed");
	});

	test("Colours feedback without changing its text", () => {
		const hintOutput = hint("Review the warning.", {
			colour: true,
		});
		const emptyOutput = emptyState("No results", "", {
			colour: true,
		});
		const errorOutput = errorBlock("Build failed", ["Compilation stopped."], {
			colour: true,
		});

		expect(hintOutput).toContain("\u001b[38;2;139;189;255m");
		expect(emptyOutput).toContain("\u001b[38;2;111;127;135m");
		expect(errorOutput).toContain("\u001b[38;2;255;114;114m");
		expect(stripAnsi(hintOutput)).toBe("i Hint: Review the warning.");
		expect(stripAnsi(emptyOutput)).toBe("– No results");
		expect(stripAnsi(errorOutput)).toContain("× Error: Build failed");
	});
});
