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
				name: "type",
				type: "string",
				required: false,
				default: "unknown",
			},
			{
				name: "label",
				type: "string",
				required: false,
				default: null,
			},
			{
				name: "detail",
				type: "string",
				required: false,
				default: "",
			},
		]);
		expect(status.fields).toEqual(status.params.map((param) => param.name));
	});

	test("Describes the complete adapter input contracts", () => {
		const nextStepBlock = rendererCatalogue.find((renderer) => renderer.name === "next-step-block");
		const row = rendererCatalogue.find((renderer) => renderer.name === "row");

		expect(nextStepBlock.params).toEqual([
			{
				name: "next",
				type: "string",
				required: false,
				default: "",
				languageNames: {
					python: "next_step",
					swift: "nextStep",
				},
			},
			{
				name: "reason",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "title",
				type: "string",
				required: false,
				default: null,
			},
			{
				name: "commands",
				type: "string[]",
				required: false,
				default: [],
			},
			{
				name: "alternatives",
				type: "string[]",
				required: false,
				default: [],
			},
		]);
		expect(row.params.map((param) => param.name)).toEqual([
			"label",
			"value",
			"result",
			"labelWidth",
			"labelColour",
			"valueColour",
			"separator",
			"wrap",
			"wrapWidth",
		]);
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
			["agent-transcript", ["entries", "title"]],
			[
				"audit-finding",
				["result", "finding", "location", "recommendation", "evidence", "references", "title"],
			],
			["bar-chart", ["rows", "barWidth"]],
			["bullet-list", ["items", "wrapWidth"]],
			["chip", ["label", "tone"]],
			[
				"command-result",
				["result", "summary", "command", "exitCode", "duration", "details", "title"],
			],
			["compact-data-table", ["columns", "rows", "summary", "title"]],
			["confirmation-result", ["state", "action", "item", "detail", "title"]],
			["diagnostic-report", ["title", "checks", "findings", "skippedChecks", "nextActions"]],
			["diff-block", ["lines", "path", "title"]],
			["divider", ["label", "dividerWidth", "character", "dividerColour", "labelColour"]],
			["empty-state", ["title", "detail"]],
			["error-block", ["title", "lines"]],
			["hint", ["message"]],
			["labelled-line", ["label", "message", "icon", "tone", "wrap", "wrapWidth"]],
			["next-step-block", ["next", "reason", "title", "commands", "alternatives"]],
			["panel", ["lines", "title", "tone", "panelWidth"]],
			["progress-bar", ["max", "value", "barWidth", "tone"]],
			[
				"row",
				[
					"label",
					"value",
					"result",
					"labelWidth",
					"labelColour",
					"valueColour",
					"separator",
					"wrap",
					"wrapWidth",
				],
			],
			["row-group", ["rows", "labelWidth", "wrap", "wrapWidth"]],
			["sparkline", ["values", "width", "label", "tone"]],
			["span", ["value", "tone", "weight"]],
			["status", ["type", "label", "detail"]],
			["step", ["label", "state"]],
			["step-progress", ["current", "steps"]],
			["table", ["columns", "rows", "width"]],
			["task-summary", ["result", "task", "title", "summary", "completed", "remaining"]],
		]);
	});

	test("Returns data-only JSON", () => {
		const output = renderCatalogue(parseCatalogueRequest("describe", ["progress-bar"]), {
			profile: "json",
		});

		const data = JSON.parse(output);

		expect(data.name).toBe("progress-bar");
		expect(data.fields).toEqual(["max", "value", "barWidth", "tone"]);
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
