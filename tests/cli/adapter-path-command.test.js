import { existsSync } from "node:fs";

import { describe, expect, test } from "bun:test";

import {
	adapterNames,
	parseAdapterPathRequest,
	renderAdapterPath,
} from "../../src/cli/adapter-path-command.js";

describe("parseAdapterPathRequest", () => {
	test("Parses supported adapter names", () => {
		expect(parseAdapterPathRequest(["bash"])).toEqual({
			adapter: "bash",
		});
		expect(parseAdapterPathRequest(["python"])).toEqual({
			adapter: "python",
		});
	});

	test("Rejects unsupported adapter requests", () => {
		expect(() => parseAdapterPathRequest([])).toThrow("Missing adapter");
		expect(() => parseAdapterPathRequest(["ruby"])).toThrow("Unknown adapter: ruby");
		expect(() => parseAdapterPathRequest(["bash", "extra"])).toThrow(
			"Unexpected adapter-path argument: extra",
		);
	});
});

describe("renderAdapterPath", () => {
	test("Returns existing adapter paths", () => {
		for (const adapter of adapterNames) {
			const request = parseAdapterPathRequest([adapter]);

			expect(existsSync(renderAdapterPath(request))).toBe(true);
		}
	});
});
