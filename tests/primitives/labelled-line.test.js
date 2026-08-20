import { describe, expect, test } from "bun:test";

import { labelledLine, stripAnsi } from "../../src/index.js";

describe("labelledLine", () => {
	test("Renders an icon, label, and message", () => {
		const output = labelledLine("Notice", "Check the output.", {
			colour: false,
			icon: "!",
		});

		expect(output).toBe("! Notice: Check the output.");
	});

	test("Renders a line without an icon", () => {
		const output = labelledLine("Notice", "Check the output.", {
			colour: false,
		});

		expect(output).toBe("Notice: Check the output.");
	});

	test("Wraps the message and aligns continuation lines", () => {
		const output = labelledLine("Details", "one two three four", {
			colour: false,
			wrapWidth: 12,
		});

		expect(output).toBe("Details: one two\n         three four");
	});

	test("Uses the terminal width when a wrapping width is not provided", () => {
		const output = labelledLine("Details", "one two three four", {
			colour: false,
			width: 12,
		});

		expect(output).toBe(
			[
				"Details: one",
				`${" ".repeat(9)}two`,
				`${" ".repeat(9)}thr`,
				`${" ".repeat(9)}ee`,
				`${" ".repeat(9)}fou`,
				`${" ".repeat(9)}r`,
			].join("\n"),
		);
	});

	test("Preserves the message when wrapping is disabled", () => {
		const output = labelledLine("Output", "first\nsecond", {
			colour: false,
			wrap: false,
		});

		expect(output).toBe("Output: first\nsecond");
	});

	test("Colours the prefix with the requested tone", () => {
		const output = labelledLine("Warning", "Review the output.", {
			colour: true,
			icon: "!",
			tone: "warning",
		});

		expect(output).toContain("\u001b[38;5;215m");
		expect(stripAnsi(output)).toBe("! Warning: Review the output.");
	});
});
