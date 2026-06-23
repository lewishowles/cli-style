import { describe, expect, test } from "bun:test";

import { progressBar, stripAnsi } from "../../src/index.js";

describe("progressBar", () => {
	test("Renders progress with numeric text", () => {
		const output = progressBar({
			barWidth: 10,
			colour: false,
			max: 10,
			value: 4,
		});

		expect(output).toBe("[████░░░░░░] 40% (4/10)");
	});

	test("Renders an ASCII bar when Unicode is disabled", () => {
		const output = progressBar({
			barWidth: 10,
			colour: false,
			max: 10,
			unicode: false,
			value: 4,
		});

		expect(output).toBe("[####------] 40% (4/10)");
	});

	test("Clamps values to the visual range", () => {
		const aboveMaximum = progressBar({
			barWidth: 5,
			colour: false,
			max: 10,
			value: 12,
		});
		const belowMinimum = progressBar({
			barWidth: 5,
			colour: false,
			max: 10,
			value: -2,
		});

		expect(aboveMaximum).toBe("[█████] 100% (12/10)");
		expect(belowMinimum).toBe("[░░░░░] 0% (-2/10)");
	});

	test("Falls back when values or dimensions are invalid", () => {
		const output = progressBar({
			barWidth: 0,
			colour: false,
			max: 0,
			value: Number.NaN,
		});

		expect(output).toBe("[░] 0% (0/100)");
	});

	test("Colours filled and empty segments", () => {
		const output = progressBar({
			barWidth: 4,
			colour: true,
			max: 4,
			tone: "warning",
			value: 2,
		});

		expect(output).toContain("\u001b[38;2;244;189;95m██\u001b[0m");
		expect(output).toContain("\u001b[38;2;148;163;170m░░\u001b[0m");
		expect(stripAnsi(output)).toBe("[██░░] 50% (2/4)");
	});
});
