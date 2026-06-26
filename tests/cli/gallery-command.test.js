import { describe, expect, test } from "bun:test";

import { parseGalleryRequest } from "../../src/cli/gallery-command.js";

describe("parseGalleryRequest", () => {
	test("Defaults to the current terminal variant", () => {
		expect(parseGalleryRequest([])).toEqual({
			fixture: undefined,
			interactive: false,
			section: undefined,
			variant: "current",
			variants: false,
			width: undefined,
		});
	});

	test("Parses variants, sections, fixtures, and variants mode", () => {
		expect(parseGalleryRequest(["no-colour", "--section", "patterns"])).toEqual({
			fixture: undefined,
			interactive: false,
			section: "patterns",
			variant: "no-colour",
			variants: false,
			width: undefined,
		});
		expect(parseGalleryRequest(["plain", "--fixture", "audit-finding"])).toEqual({
			fixture: "audit-finding",
			interactive: false,
			section: undefined,
			variant: "plain",
			variants: false,
			width: undefined,
		});
		expect(parseGalleryRequest(["--fixture", "confirmation-result"]).fixture).toBe("confirmation-result");
		expect(parseGalleryRequest(["--fixture", "next-step-block"]).fixture).toBe("next-step-block");
		expect(parseGalleryRequest(["--variants"])).toEqual({
			fixture: undefined,
			interactive: false,
			section: undefined,
			variant: "current",
			variants: true,
			width: undefined,
		});
		expect(parseGalleryRequest(["--matrix"])).toEqual({
			fixture: undefined,
			interactive: false,
			section: undefined,
			variant: "current",
			variants: true,
			width: undefined,
		});
	});

	test("Parses global rendering flags and width", () => {
		expect(parseGalleryRequest(["--plain", "--profile", "agent", "--width", "32"])).toEqual({
			fixture: undefined,
			interactive: false,
			section: undefined,
			variant: "current",
			variants: false,
			width: 32,
		});
		expect(parseGalleryRequest(["--profile=ci", "--width=48"]).width).toBe(48);
		expect(parseGalleryRequest(["--no-colour", "--no-unicode"]).variant).toBe("current");
	});

	test("Parses interactive mode", () => {
		expect(parseGalleryRequest(["--interactive"])).toEqual({
			fixture: undefined,
			interactive: true,
			section: undefined,
			variant: "current",
			variants: false,
			width: undefined,
		});
	});

	test("Rejects unsupported arguments", () => {
		expect(() => parseGalleryRequest(["missing"])).toThrow("Unknown gallery variant: missing");
		expect(() => parseGalleryRequest(["current", "plain"])).toThrow("Unexpected gallery argument: plain");
		expect(() => parseGalleryRequest(["--section"])).toThrow("Missing value for --section");
		expect(() => parseGalleryRequest(["--fixture", "missing"])).toThrow("Unknown gallery fixture: missing");
		expect(() => parseGalleryRequest(["--profile", "missing"])).toThrow("Unknown profile: missing");
		expect(() => parseGalleryRequest(["--profile=json"])).toThrow("Gallery does not support json output");
		expect(() => parseGalleryRequest(["--json"])).toThrow("Gallery does not support json output");
		expect(() => parseGalleryRequest(["--width", "0"])).toThrow("Gallery width must be a positive integer");
	});
});
