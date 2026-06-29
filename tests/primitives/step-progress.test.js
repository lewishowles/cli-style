import { describe, expect, test } from "bun:test";

import { step, stepProgress, stripAnsi } from "../../src/index.js";

describe("step", () => {
	test("Renders completed, current, and pending states", () => {
		const completed = step("Install dependencies", "complete", {
			colour: false,
		});
		const current = step("Build package", "current", {
			colour: false,
		});
		const pending = step("Publish release", "pending", {
			colour: false,
		});

		expect(completed).toBe("✓ Install dependencies");
		expect(current).toBe("… Build package");
		expect(pending).toBe("– Publish release");
	});

	test("Uses ASCII symbols when Unicode is disabled", () => {
		const output = step("Build package", "current", {
			colour: false,
			unicode: false,
		});

		expect(output).toBe("... Build package");
	});

	test("Accepts result states for failed or warning steps", () => {
		const failed = step("Unit tests", "failed", {
			colour: false,
		});
		const warning = step("Accessibility audit", "warning", {
			colour: false,
		});

		expect(failed).toBe("× Unit tests");
		expect(warning).toBe("⚠ Accessibility audit");
	});
});

describe("stepProgress", () => {
	test("Renders ordered progress with explicit counts", () => {
		const output = stepProgress({
			colour: false,
			current: 1,
			steps: [
				"Install dependencies",
				"Build package",
				"Publish release",
			],
		});

		expect(output).toBe([
			"1/3 ✓ Install dependencies",
			"2/3 … Build package",
			"3/3 – Publish release",
		].join("\n"));
	});

	test("Clamps the current step to the available range", () => {
		const output = stepProgress({
			colour: false,
			current: 10,
			steps: ["Install", "Build"],
		});

		expect(output).toBe([
			"1/2 ✓ Install",
			"2/2 … Build",
		].join("\n"));
	});

	test("Returns an empty string when no valid steps are provided", () => {
		const output = stepProgress({
			steps: [null, ""],
		});

		expect(output).toBe("");
	});

	test("Colours state symbols without changing progress text", () => {
		const output = stepProgress({
			colour: true,
			current: 1,
			steps: ["Install", "Build", "Publish"],
		});

		expect(output).toContain("\u001b[38;2;143;223;114m✓\u001b[0m");
		expect(output).toContain("\u001b[38;2;139;189;255m…\u001b[0m");
		expect(output).toContain("\u001b[38;2;111;127;135m–\u001b[0m");
		expect(stripAnsi(output)).toBe([
			"1/3 ✓ Install",
			"2/3 … Build",
			"3/3 – Publish",
		].join("\n"));
	});
});
