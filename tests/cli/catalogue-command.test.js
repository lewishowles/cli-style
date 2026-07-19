import { describe, expect, test } from "bun:test";

import { rendererNames } from "../../src/catalogue/renderer-catalogue.js";
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
