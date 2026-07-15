import { describe, expect, test } from "bun:test";

import { row, rowGroup, stripAnsi } from "../../src/index.js";

describe("rowGroup", () => {
	test("Aligns rows with different label lengths", () => {
		const rows = [
			{
				label: "Source",
				value: "package.json",
			},
			{
				label: "Selected content root",
				value: "main",
			},
			{
				label: "Checks",
				value: "unit, build",
			},
		];

		const output = rowGroup({
			colour: false,
			rows,
		});

		const expected = rows
			.map((entry) =>
				row(entry.label, entry.value, {
					colour: false,
					labelWidth: "Selected content root".length,
				}),
			)
			.join("\n");

		expect(output).toBe(expected);
	});

	test("Aligns result-bearing and plain rows by displayed label width", () => {
		const rows = [
			{
				label: "Plain",
				value: "one",
			},
			{
				label: "Result",
				result: "failed",
				value: "two",
			},
		];

		const output = rowGroup({
			colour: false,
			rows,
			unicode: false,
		});

		const expected = rows
			.map((entry) =>
				row(entry.label, entry.value, {
					colour: false,
					labelWidth: "x Result".length,
					result: entry.result,
					unicode: false,
				}),
			)
			.join("\n");

		expect(output).toBe(expected);
	});

	test("Returns an empty string for an empty rows array", () => {
		expect(rowGroup({ rows: [] })).toBe("");
	});

	test("Preserves per-row colour and separator overrides", () => {
		const output = rowGroup({
			colour: true,
			rows: [
				{
					label: "One",
					labelColour: "success",
					separator: " => ",
					value: "value",
				},
				{
					label: "Longer",
					value: "other",
				},
			],
		});

		expect(output).toContain("\u001b[38;2;143;223;114mOne");
		expect(stripAnsi(output).split("\n")[0]).toBe("One    => value");
	});
});
