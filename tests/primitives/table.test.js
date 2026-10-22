import { describe, expect, test } from "bun:test";

import { foreground, stripAnsi, table } from "../../src/index.js";

describe("table", () => {
	test("Expands tabs before aligning headers and cells", () => {
		const output = table({
			columns: [
				{ key: "a", label: "A\tB" },
				{ key: "c", label: "C" },
			],
			rows: [{ a: "X\tY", c: "Z" }],
			width: 30,
		});

		expect(output).toBe("A   B  C\n─────  ─\nX   Y  Z");
	});

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

	test("Truncates capped columns without falling back to blocks", () => {
		const output = table({
			colour: false,
			columns: [
				{
					key: "source",
					label: "Source",
				},
				{
					key: "path",
					label: "Path",
					maxWidth: 10,
				},
			],
			rows: [
				{
					path: "configuration/agents/skills",
					source: "Build",
				},
			],
			width: 20,
		});

		expect(output).toBe(["Source  Path", "──────  ──────────", "Build   configura…"].join("\n"));
	});

	test("Truncates capped headers without column drift", () => {
		const output = table({
			colour: false,
			columns: [
				{
					key: "path",
					label: "Path",
					maxWidth: 3,
				},
				{
					key: "extra",
					label: "Extra",
				},
			],
			rows: [
				{
					extra: "x",
					path: "configuration/agents/skills",
				},
			],
			width: 30,
		});

		expect(output).toBe(["Pa…  Extra", "───  ─────", "co…  x"].join("\n"));
	});

	test("Wraps capped columns without falling back to blocks", () => {
		const output = table({
			colour: false,
			columns: [
				{
					key: "source",
					label: "Source",
				},
				{
					key: "path",
					label: "Path",
					maxWidth: 10,
					overflow: "wrap",
				},
			],
			rows: [
				{
					path: "configuration/agents/skills",
					source: "Build",
				},
			],
			width: 20,
		});

		expect(output).toBe(
			[
				"Source  Path",
				"──────  ──────────",
				"Build   configurat",
				"        ion/agents",
				"        /skills",
			].join("\n"),
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

	test("Aligns coloured headers and values like plain text", () => {
		const colour = { colour: true };

		const columns = [
			{ key: "name", label: foreground("ID", "success", colour) },
			{ key: "status", label: "Status" },
		];

		const rows = [
			{ name: foreground("Go", "success", colour), status: "Passed" },
			{ name: "Long", status: "Waiting" },
		];

		const output = table({ colour: false, columns, rows, width: 40 });

		const plainOutput = table({
			colour: false,
			columns: [{ key: "name", label: "ID" }, columns[1]],
			rows: [{ name: "Go", status: "Passed" }, rows[1]],
			width: 40,
		});

		expect(stripAnsi(output)).toBe(plainOutput);
		expect(output).toContain(foreground("Go", "success", colour));
	});

	test("Aligns wide headers and values like two-column plain text", () => {
		const columns = [
			{ key: "name", label: "界" },
			{ key: "status", label: "Status" },
		];

		const rows = [
			{ name: "👍🏽", status: "Passed" },
			{ name: "A", status: "Waiting" },
		];

		const output = table({ colour: false, columns, rows, width: 40 });

		const plainOutput = table({
			colour: false,
			columns: [{ key: "name", label: "AB" }, columns[1]],
			rows: [{ name: "CD", status: "Passed" }, rows[1]],
			width: 40,
		});

		expect(output.replace("界", "AB").replace("👍🏽", "CD")).toBe(plainOutput);
	});

	test("Pads coloured and wide labels in narrow key/value blocks", () => {
		const label = foreground("界", "success", { colour: true });

		const columns = [
			{ key: "name", label },
			{ key: "status", label: "State" },
		];

		const rows = [{ name: "Go", status: "Ready" }];

		const output = table({ colour: false, columns, rows, width: 7 });

		const plainOutput = table({
			colour: false,
			columns: [{ key: "name", label: "AB" }, columns[1]],
			rows,
			width: 7,
		});

		expect(stripAnsi(output).replace("界", "AB")).toBe(plainOutput);
	});

	test("Truncates a coloured cell with wide characters to the column width", () => {
		const value = foreground("A界BC", "success", { colour: true });

		const output = table({
			colour: false,
			columns: [{ key: "detail", label: "Detail", maxWidth: 3 }],
			rows: [{ detail: value }],
			width: 20,
		});

		expect(output).toBe("De…\n───\n\u001b[38;5;114mA\u001b[0m…");
	});

	test("Wraps coloured wide cells without splitting characters or losing colour", () => {
		const value = foreground("AB界C", "success", { colour: true });

		const output = table({
			colour: false,
			columns: [
				{ key: "detail", label: "Detail", maxWidth: 3, overflow: "wrap" },
				{ key: "state", label: "State" },
			],
			rows: [{ detail: value, state: "Ready" }],
			width: 20,
		});

		expect(stripAnsi(output)).toBe("De…  State\n───  ─────\nAB   Ready\n界C  ");
		expect(output).toContain("\u001b[38;5;114mAB\u001b[0m   Ready");
		expect(output).toContain("\u001b[38;5;114m界C\u001b[0m");
	});

	test("Places a too-wide character on its own line in a one-column cell", () => {
		const output = table({
			colour: false,
			columns: [{ key: "detail", label: "D", maxWidth: 1, overflow: "wrap" }],
			rows: [{ detail: "界A" }],
			width: 20,
		});

		expect(output).toBe("D\n─\n界\nA");
	});
});
