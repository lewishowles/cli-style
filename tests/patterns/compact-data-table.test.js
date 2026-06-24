import { describe, expect, test } from "bun:test";

import {
	compactDataTable,
	profiles,
} from "../../src/index.js";

describe("compactDataTable", () => {
	test("Renders a titled table with summary context", () => {
		const output = compactDataTable({
			columns: [
				{
					key: "package",
					label: "Package",
				},
				{
					key: "status",
					label: "Status",
				},
				{
					key: "version",
					label: "Version",
				},
			],
			rows: [
				{
					package: "components",
					status: "minor",
					version: "2.8.0",
				},
				{
					package: "helpers",
					status: "current",
					version: "4.1.0",
				},
			],
			summary: "2 packages checked",
			title: "Package updates",
		}, {
			colour: false,
			width: 80,
		});

		expect(output).toBe([
			"Package updates",
			"2 packages checked",
			"",
			"Package     Status   Version",
			"──────────  ───────  ───────",
			"components  minor    2.8.0",
			"helpers     current  4.1.0",
		].join("\n"));
	});

	test("Uses key/value blocks at narrow widths", () => {
		const output = compactDataTable({
			columns: [
				{
					key: "package",
					label: "Package",
				},
				{
					key: "version",
					label: "Version",
				},
			],
			rows: [
				{
					package: "components",
					version: "2.8.0",
				},
				{
					package: "helpers",
					version: "4.1.0",
				},
			],
			title: "Package updates",
		}, {
			colour: false,
			unicode: false,
			width: 16,
		});

		expect(output).toBe([
			"Package updates",
			"",
			"Package  components",
			"Version  2.8.0",
			"",
			"Package  helpers",
			"Version  4.1.0",
		].join("\n"));
	});

	test("Uses a Markdown title for the agent profile", () => {
		const output = compactDataTable({
			columns: [
				{
					key: "check",
					label: "Check",
				},
				{
					key: "result",
					label: "Result",
				},
			],
			rows: [
				{
					check: "unit",
					result: "passed",
				},
			],
			summary: "1 check",
			title: "Diagnostics",
		}, {
			colour: false,
			profile: profiles.AGENT,
			width: 80,
		});

		expect(output).toBe([
			"# Diagnostics",
			"1 check",
			"",
			"Check  Result",
			"─────  ──────",
			"unit   passed",
		].join("\n"));
	});

	test("Returns structured input unchanged for the JSON profile", () => {
		const data = {
			columns: [
				{
					key: "check",
					label: "Check",
				},
			],
			rows: [
				{
					check: "unit",
				},
			],
		};

		expect(compactDataTable(data, {
			profile: profiles.JSON,
		})).toBe(data);
	});

	test("Returns an empty string for invalid or empty table data", () => {
		expect(compactDataTable(null)).toBe("");
		expect(compactDataTable([])).toBe("");
		expect(compactDataTable({
			columns: [],
			rows: [],
		})).toBe("");
	});
});
