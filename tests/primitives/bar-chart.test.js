import { describe, expect, test } from "bun:test";

import { barChart, stripAnsi } from "../../src/index.js";

describe("barChart", () => {
	test("Renders labelled rows against a shared scale", () => {
		const output = barChart({
			barWidth: 10,
			colour: false,
			rows: [
				{
					label: "Passed",
					value: 10,
				},
				{
					label: "Warnings",
					value: 4,
				},
			],
		});

		expect(output).toBe(["Passed    ██████████ 10", "Warnings  ████       4"].join("\n"));
	});

	test("Renders ASCII bars when Unicode is disabled", () => {
		const output = barChart({
			barWidth: 5,
			colour: false,
			rows: [
				{
					label: "Checks",
					value: 3,
				},
			],
			unicode: false,
		});

		expect(output).toBe("Checks  ##### 3");
	});

	test("Scales negative values by magnitude and preserves their sign", () => {
		const output = barChart({
			barWidth: 10,
			colour: false,
			rows: [
				{
					label: "Added",
					value: 10,
				},
				{
					label: "Removed",
					value: -5,
				},
			],
		});

		expect(output).toBe(["Added    ██████████ 10", "Removed  █████      -5"].join("\n"));
	});

	test("Returns an empty string when no valid rows are provided", () => {
		const output = barChart({
			rows: [
				null,
				{
					label: "Missing value",
				},
			],
		});

		expect(output).toBe("");
	});

	test("Colours labels, bars, and values", () => {
		const output = barChart({
			barWidth: 4,
			colour: true,
			rows: [
				{
					label: "Warnings",
					tone: "warning",
					value: 2,
				},
				{
					label: "Removed",
					value: -1,
				},
			],
		});

		expect(output).toContain("\u001b[38;5;215m████\u001b[0m");
		expect(output).toContain("\u001b[38;5;215m██\u001b[0m");
		expect(stripAnsi(output)).toBe(["Warnings  ████ 2", "Removed   ██   -1"].join("\n"));
	});
});
