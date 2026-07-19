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
		expect(output).toContain("- Added render command");
		expect(output).toContain("- Add adapters");
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
		expect(rendererNames).toContain("sparkline");
	});
});
