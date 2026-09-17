import { describe, expect, test } from "bun:test";

import {
	renderOptions,
	rendererCatalogue,
	rendererNames,
} from "../../src/catalogue/renderer-catalogue.js";
import { parseCatalogueRequest, renderCatalogue } from "../../src/cli/catalogue-command.js";
import { rendererNames as renderCommandNames } from "../../src/cli/render-command.js";

describe("Catalogue commands", () => {
	test("Lists primitives and patterns", () => {
		const output = renderCatalogue(parseCatalogueRequest("list"));

		expect(output).toContain("primitive");
		expect(output).toContain("pattern");
		expect(output).toContain("progress-bar");
		expect(output).toContain("task-summary");
	});

	test("Describes a renderer and its focused gallery fixture", () => {
		const output = renderCatalogue(parseCatalogueRequest("describe", ["task-summary"]));

		expect(output).toContain("JavaScript: taskSummary");
		expect(output).toContain("Fields: result, task");
		expect(output).toContain("cli-style gallery --fixture task-summary");
	});

	test("Describes typed parameters and derives fields from them", () => {
		const status = rendererCatalogue.find((renderer) => renderer.name === "status");

		expect(status.params).toEqual([
			{
				name: "detail",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "label",
				type: "string",
				required: false,
				default: null,
			},
			{
				name: "type",
				type: "string",
				required: false,
				default: "unknown",
			},
		]);
		expect(status.fields).toEqual(status.params.map((param) => param.name));
	});

	test("Exposes shared render options with adapter types and defaults", () => {
		expect(renderOptions).toEqual([
			{
				name: "profile",
				type: "string",
				required: false,
				default: null,
			},
			{
				name: "width",
				type: "number",
				required: false,
				default: null,
			},
			{
				name: "plain",
				type: "boolean",
				required: false,
				default: false,
			},
			{
				name: "noColour",
				type: "boolean",
				required: false,
				default: false,
			},
			{
				name: "noUnicode",
				type: "boolean",
				required: false,
				default: false,
			},
			{
				name: "extraArgs",
				type: "string[]",
				required: false,
				default: [],
			},
		]);
	});

	test("Preserves the catalogue field lists", () => {
		expect(rendererCatalogue.map((renderer) => [renderer.name, renderer.fields])).toEqual([
			["agent-transcript", ["entries"]],
			["audit-finding", ["finding", "result"]],
			["bar-chart", ["rows"]],
			["bullet-list", ["items"]],
			["chip", ["label", "tone"]],
			["command-result", ["result", "summary"]],
			["compact-data-table", ["columns", "rows"]],
			["confirmation-result", ["action", "state"]],
			["diagnostic-report", ["findings", "summary"]],
			["diff-block", ["lines"]],
			["divider", ["label"]],
			["empty-state", ["detail", "title"]],
			["error-block", ["lines", "title"]],
			["hint", ["message"]],
			["labelled-line", ["icon", "label", "message", "wrap", "wrapWidth"]],
			["next-step-block", ["next", "reason"]],
			["panel", ["lines", "title", "tone"]],
			["progress-bar", ["max", "value"]],
			["row", ["label", "value", "wrap", "wrapWidth"]],
			["row-group", ["rows", "wrap", "wrapWidth"]],
			["sparkline", ["values"]],
			["span", ["tone", "value"]],
			["status", ["detail", "label", "type"]],
			["step", ["label", "state"]],
			["step-progress", ["current", "steps"]],
			["table", ["columns", "rows"]],
			["task-summary", ["result", "task"]],
		]);
	});

	test("Returns data-only JSON", () => {
		const output = renderCatalogue(parseCatalogueRequest("describe", ["progress-bar"]), {
			profile: "json",
		});

		const data = JSON.parse(output);

		expect(data.name).toBe("progress-bar");
		expect(data.fields).toEqual(["max", "value"]);
	});

	test("Rejects invalid requests", () => {
		expect(() => parseCatalogueRequest("describe", [])).toThrow(
			"Usage: cli-style describe <renderer>",
		);
		expect(() => parseCatalogueRequest("describe", ["missing"])).toThrow(
			"Unknown renderer: missing",
		);
	});

	test("Keeps render validation and catalogue names aligned", () => {
		expect(renderCommandNames).toEqual(rendererNames);
	});
});
