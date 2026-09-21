import { describe, expect, test } from "bun:test";

import {
	parseRenderRequest,
	renderJsonInput,
	rendererNames,
} from "../../src/cli/render-command.js";
import { profiles } from "../../src/profiles/profiles.js";

describe("parseRenderRequest", () => {
	test("Parses renderer and render options", () => {
		expect(
			parseRenderRequest(["status", "--plain", "--profile", "agent", "--width", "48"]),
		).toEqual({
			renderer: "status",
			width: 48,
		});
		expect(parseRenderRequest(["task-summary", "--profile=ci", "--width=64"]).width).toBe(64);
		expect(parseRenderRequest(["divider", "--no-colour", "--no-unicode"]).renderer).toBe("divider");
	});

	test("Rejects unsupported render requests", () => {
		expect(() => parseRenderRequest([])).toThrow("Missing renderer");
		expect(() => parseRenderRequest(["missing"])).toThrow("Unknown renderer: missing");
		expect(() => parseRenderRequest(["status", "extra"])).toThrow(
			"Unexpected render argument: extra",
		);
		expect(() => parseRenderRequest(["status", "--profile", "missing"])).toThrow(
			"Unknown profile: missing",
		);
		expect(() => parseRenderRequest(["status", "--profile=json"])).toThrow(
			"Render does not support json output",
		);
		expect(() => parseRenderRequest(["status", "--json"])).toThrow(
			"Render does not support json output",
		);
		expect(() => parseRenderRequest(["status", "--width", "0"])).toThrow(
			"Render width must be a positive integer",
		);
	});
});

describe("renderJsonInput", () => {
	test("Renders a primitive from caller JSON", () => {
		const output = renderJsonInput(
			JSON.stringify({
				detail: "184 tests",
				label: "Build passed",
				type: "success",
			}),
			parseRenderRequest(["status"]),
			{
				colour: false,
				profile: profiles.HUMAN,
				unicode: true,
				width: 80,
			},
		);

		expect(output).toBe("✓ Build passed 184 tests");
	});

	test("Renders a sparkline from caller JSON", () => {
		const output = renderJsonInput(
			JSON.stringify({
				label: "Latency",
				values: [1, 4, 2],
			}),
			parseRenderRequest(["sparkline"]),
			{
				colour: false,
				profile: profiles.HUMAN,
				unicode: false,
				width: 3,
			},
		);

		expect(output).toContain("Latency: .#-");
		expect(output).toContain("latest=2 min=1 max=4");
	});

	test("Renders a pattern from caller JSON", () => {
		const output = renderJsonInput(
			JSON.stringify({
				completed: ["Added render command"],
				remaining: ["Add adapters"],
				title: "Task summary",
			}),
			parseRenderRequest(["task-summary"]),
			{
				colour: false,
				profile: profiles.HUMAN,
				unicode: true,
				width: 80,
			},
		);

		expect(output).toContain("Task summary");
		expect(output).toContain("• Added render command");
		expect(output).toContain("• Add adapters");
	});

	test("Uses the panel width from caller JSON without a CLI width", () => {
		const output = renderJsonInput(
			JSON.stringify({
				lines: ["A long line that must wrap"],
				width: 20,
			}),
			parseRenderRequest(["panel"]),
			{
				colour: false,
				profile: profiles.HUMAN,
				unicode: true,
				width: 80,
			},
		);

		expect(output.split("\n").every((line) => line.length <= 20)).toBe(true);
	});

	test("Uses the error-block width from caller JSON without a CLI width", () => {
		const output = renderJsonInput(
			JSON.stringify({
				lines: ["A long line that must wrap"],
				title: "Failure",
				width: 20,
			}),
			parseRenderRequest(["error-block"]),
			{
				colour: false,
				profile: profiles.HUMAN,
				unicode: true,
				width: 80,
			},
		);

		expect(output.split("\n").every((line) => line.length <= 20)).toBe(true);
	});

	test("Uses the bullet-list width from caller JSON without a CLI width", () => {
		const output = renderJsonInput(
			JSON.stringify({
				items: ["A long bullet item that must wrap within the payload width"],
				width: 24,
			}),
			parseRenderRequest(["bullet-list"]),
			{
				colour: false,
				profile: profiles.HUMAN,
				unicode: true,
				width: 80,
			},
		);

		expect(output.split("\n").every((line) => line.length <= 24)).toBe(true);
	});

	test("Uses the labelled-line width from caller JSON without a CLI width", () => {
		const output = renderJsonInput(
			JSON.stringify({
				label: "Status",
				message: "A long labelled message that must wrap within the payload width",
				width: 24,
			}),
			parseRenderRequest(["labelled-line"]),
			{
				colour: false,
				profile: profiles.HUMAN,
				unicode: true,
				width: 80,
			},
		);

		expect(output.split("\n").every((line) => line.length <= 24)).toBe(true);
	});

	test("Uses the row width from caller JSON without a CLI width", () => {
		const output = renderJsonInput(
			JSON.stringify({
				label: "Status",
				value: "A long row value that must wrap within the payload width",
				width: 24,
			}),
			parseRenderRequest(["row"]),
			{
				colour: false,
				profile: profiles.HUMAN,
				unicode: true,
				width: 80,
			},
		);

		expect(output.split("\n").every((line) => line.length <= 24)).toBe(true);
	});

	test("Uses the row-group width from caller JSON without a CLI width", () => {
		const output = renderJsonInput(
			JSON.stringify({
				rows: [
					{
						label: "Status",
						value: "A long row-group value that must wrap within the payload width",
					},
				],
				width: 24,
			}),
			parseRenderRequest(["row-group"]),
			{
				colour: false,
				profile: profiles.HUMAN,
				unicode: true,
				width: 80,
			},
		);

		expect(output.split("\n").every((line) => line.length <= 24)).toBe(true);
	});

	test("Uses the table width from caller JSON without a CLI width", () => {
		const output = renderJsonInput(
			JSON.stringify({
				columns: [
					{ key: "name", label: "Name" },
					{ key: "status", label: "Status" },
					{ key: "detail", label: "Detail" },
				],
				rows: [
					{
						detail: "Requires manual review",
						name: "Build",
						status: "Passed with warning",
					},
				],
				width: 40,
			}),
			parseRenderRequest(["table"]),
			{
				colour: false,
				profile: profiles.HUMAN,
				unicode: true,
				width: 80,
			},
		);

		expect(output.split("\n").every((line) => line.length <= 40)).toBe(true);
	});

	test("Uses the sparkline width from caller JSON without a CLI width", () => {
		const output = renderJsonInput(
			JSON.stringify({
				label: "Latency",
				values: [0, 1, 2, 3, 4, 5],
				width: 3,
			}),
			parseRenderRequest(["sparkline"]),
			{
				colour: false,
				profile: profiles.HUMAN,
				unicode: false,
				width: 80,
			},
		);

		expect(output.split(" latest=")[0]).toBe("Latency: .=#");
	});

	test("Renders a structured diff block from caller JSON", () => {
		const output = renderJsonInput(
			JSON.stringify({
				lines: [
					{
						text: "next()",
						type: "header",
					},
					{
						text: "return next;",
						type: "added",
					},
				],
			}),
			parseRenderRequest(["diff-block"]),
			{
				colour: false,
				profile: profiles.CI,
				unicode: false,
			},
		);

		expect(output).toBe(["@@ next()", "+ return next;"].join("\n"));
	});

	test("Rejects invalid input and json profile", () => {
		expect(() => renderJsonInput("{", parseRenderRequest(["status"]))).toThrow(
			"Render input must be valid JSON",
		);
		expect(() => renderJsonInput("[]", parseRenderRequest(["status"]))).toThrow(
			"Render input must be a JSON object",
		);
		expect(() =>
			renderJsonInput("{}", parseRenderRequest(["status"]), {
				profile: profiles.JSON,
			}),
		).toThrow("Render does not support json output");
	});

	test("Exposes stable renderer names", () => {
		expect(rendererNames).toContain("status");
		expect(rendererNames).toContain("span");
		expect(rendererNames).toContain("task-summary");
		expect(rendererNames).toContain("diagnostic-report");
		expect(rendererNames).toContain("diff-block");
		expect(rendererNames).toContain("sparkline");
	});
});
