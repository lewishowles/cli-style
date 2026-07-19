import { describe, expect, test } from "bun:test";

import { stripAnsi, table } from "../../src/index.js";

describe("table", () => {
	test("Renders aligned columns with a header rule", () => {
		const output = table({
			colour: false,
			columns: [
				{
					key: "name",
					label: "Name",
				},
				{
					key: "status",
					label: "Status",
				},
			],
			rows: [
				{
					name: "Type check",
					status: "Passed",
				},
				{
					name: "Unit",
					status: "Warning",
				},
			],
			width: 80,
		});

		expect(output).toBe(
			[
				"Name        Status",
				"──────────  ───────",
				"Type check  Passed",
				"Unit        Warning",
			].join("\n"),
		);
	});

	test("Falls back to key/value blocks at narrow widths", () => {
		const output = table({
			colour: false,
			columns: [
				{
					key: "name",
					label: "Name",
				},
				{
					key: "status",
					label: "Status",
				},
			],
			rows: [
				{
					name: "Type check",
					status: "Passed",
				},
				{
					name: "Unit",
					status: "Warning",
				},
			],
			width: 15,
		});

		expect(output).toBe(
			["Name    Type check", "Status  Passed", "", "Name    Unit", "Status  Warning"].join("\n"),
		);
	});

	test("Uses an ASCII header rule when Unicode is disabled", () => {
		const output = table({
			colour: false,
			columns: [
				{
					key: "name",
					label: "Name",
				},
			],
			rows: [
				{
					name: "Build",
				},
			],
			unicode: false,
			width: 80,
		});

		expect(output).toBe("Name\n-----\nBuild");
	});

	test("Returns an empty string for invalid table data", () => {
		const output = table({
			columns: [],
			rows: [],
		});

		expect(output).toBe("");
	});

	test("Colours headers, rules, and cell text", () => {
		const output = table({
			colour: true,
			columns: [
				{
					key: "name",
					label: "Name",
				},
				{
					key: "status",
					label: "Status",
				},
			],
			rows: [
				{
					name: "Build",
					status: "Passed",
				},
			],
			width: 80,
		});

		expect(output).toContain("\u001b[38;5;246mName ");
		expect(output).toContain("\u001b[38;5;239m");
		expect(output).toContain("\u001b[39mBuild");
		expect(stripAnsi(output)).toBe(["Name   Status", "─────  ──────", "Build  Passed"].join("\n"));
	});
});
