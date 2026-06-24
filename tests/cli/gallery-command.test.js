import { describe, expect, test } from "bun:test";

import { parseGalleryRequest } from "../../src/cli/gallery-command.js";

describe("parseGalleryRequest", () => {
	test("Defaults to the current terminal variant", () => {
		expect(parseGalleryRequest([])).toEqual({
			fixture: undefined,
			interactive: false,
			matrix: false,
			section: undefined,
			variant: "current",
		});
	});

	test("Parses variants, sections, fixtures, and matrix mode", () => {
		expect(parseGalleryRequest(["no-colour", "--section", "patterns"])).toEqual({
			fixture: undefined,
			interactive: false,
			matrix: false,
			section: "patterns",
			variant: "no-colour",
		});
		expect(parseGalleryRequest(["plain", "--fixture", "audit-finding"])).toEqual({
			fixture: "audit-finding",
			interactive: false,
			matrix: false,
			section: undefined,
			variant: "plain",
		});
		expect(parseGalleryRequest(["--matrix"])).toEqual({
			fixture: undefined,
			interactive: false,
			matrix: true,
			section: undefined,
			variant: "current",
		});
	});

	test("Parses interactive mode", () => {
		expect(parseGalleryRequest(["--interactive"])).toEqual({
			fixture: undefined,
			interactive: true,
			matrix: false,
			section: undefined,
			variant: "current",
		});
	});

	test("Rejects unsupported arguments", () => {
		expect(() => parseGalleryRequest(["missing"])).toThrow("Unknown gallery variant: missing");
		expect(() => parseGalleryRequest(["current", "plain"])).toThrow("Unexpected gallery argument: plain");
		expect(() => parseGalleryRequest(["--section"])).toThrow("Missing value for --section");
		expect(() => parseGalleryRequest(["--fixture", "missing"])).toThrow("Unknown gallery fixture: missing");
	});
});
