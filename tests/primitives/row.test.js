import { describe, expect, test } from "bun:test";

import { row, stripAnsi } from "../../src/index.js";

describe("row", () => {
	test("Renders a plain labelled value", () => {
		const output = row("Package", "@lewishowles/components", {
			colour: false,
		});

		expect(output).toBe("Package  @lewishowles/components");
	});

	test("Aligns labels with a fixed label width", () => {
		const output = row("Version", "minor: 2.7.4 -> 2.8.0", {
			colour: false,
			labelWidth: 10,
		});

		expect(output).toBe("Version     minor: 2.7.4 -> 2.8.0");
	});

	test("Renders a label without trailing separator when value is empty", () => {
		const output = row("Choose next action", "", {
			colour: false,
		});

		expect(output).toBe("Choose next action");
	});

	test("Colours the label when colour is enabled", () => {
		const output = row("Package", "@lewishowles/components", {
			colour: true,
		});

		expect(output).toBe("\u001b[38;5;246mPackage\u001b[0m  @lewishowles/components");
		expect(stripAnsi(output)).toBe("Package  @lewishowles/components");
	});

	test("Colours the value when value colour is provided", () => {
		const output = row("Status", "passed", {
			colour: true,
			valueColour: "success",
		});

		expect(output).toBe("\u001b[38;5;246mStatus\u001b[0m  \u001b[38;5;114mpassed\u001b[0m");
		expect(stripAnsi(output)).toBe("Status  passed");
	});

	test("Renders a result row with a symbol prefix", () => {
		const output = row("dist/object-BmsQavd_.js", "is 22.3 KB, above the 12.0 KB budget", {
			colour: false,
			result: "failed",
			unicode: true,
		});

		expect(output).toBe("× dist/object-BmsQavd_.js  is 22.3 KB, above the 12.0 KB budget");
	});

	test("Colours result row labels and values with the result tone", () => {
		const output = row("Package size", "over budget", {
			colour: true,
			result: "failed",
			unicode: false,
		});

		expect(output).toBe(
			"\u001b[38;5;210mx Package size\u001b[0m  \u001b[38;5;210mover budget\u001b[0m",
		);
		expect(stripAnsi(output)).toBe("x Package size  over budget");
	});

	test("Wraps long values at the default width", () => {
		const value = `${"word ".repeat(14)}ending`;

		const output = row("Details", value, {
			colour: false,
		});

		expect(output).toBe(
			[`Details  ${"word ".repeat(12)}word`, `${" ".repeat(9)}word ending`].join("\n"),
		);
	});

	test("Uses a custom wrapping width", () => {
		const output = row("Details", "one two three four", {
			colour: false,
			wrapWidth: 12,
		});

		expect(output).toBe("Details  one two\n         three four");
	});

	test("Uses the terminal width when a wrapping width is not provided", () => {
		const output = row("Details", "one two three four", {
			colour: false,
			width: 12,
		});

		expect(output).toBe(
			[
				"Details  one",
				`${" ".repeat(9)}two`,
				`${" ".repeat(9)}thr`,
				`${" ".repeat(9)}ee`,
				`${" ".repeat(9)}fou`,
				`${" ".repeat(9)}r`,
			].join("\n"),
		);
	});

	test("Passes through raw values when wrapping is disabled", () => {
		const value = "first\nsecond";

		const output = row("Output", value, {
			colour: false,
			wrap: false,
		});

		expect(output).toBe("Output  first\nsecond");
	});

	test("Applies value colour to each wrapped line", () => {
		const output = row("Value", "one two three four", {
			colour: true,
			valueColour: "success",
			wrapWidth: 12,
		});

		const lines = output.split("\n");

		expect(lines).toHaveLength(2);
		expect(lines.every((line) => line.includes("\u001b[38;5;114m"))).toBe(true);
		expect(lines.every((line) => line.endsWith("\u001b[0m"))).toBe(true);
		expect(stripAnsi(output)).toBe("Value  one two\n       three four");
	});
});
