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

		expect(output).toBe("\u001b[38;2;111;127;135mPackage\u001b[0m  @lewishowles/components");
		expect(stripAnsi(output)).toBe("Package  @lewishowles/components");
	});

	test("Colours the value when value colour is provided", () => {
		const output = row("Status", "passed", {
			colour: true,
			valueColour: "success",
		});

		expect(output).toBe(
			"\u001b[38;2;111;127;135mStatus\u001b[0m  \u001b[38;2;143;223;114mpassed\u001b[0m",
		);
		expect(stripAnsi(output)).toBe("Status  passed");
	});
});
