import { describe, expect, test } from "bun:test";

import { parseGalleryRequest } from "../../src/cli/gallery-command.js";
import { renderGallery } from "../../src/gallery/render-gallery.js";

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
		expect(parseGalleryRequest(["--fixture", "confirmation-result"]).fixture).toBe(
			"confirmation-result",
		);
		expect(parseGalleryRequest(["--fixture", "next-step-block"]).fixture).toBe("next-step-block");
		expect(parseGalleryRequest(["--fixture", "diff-block"]).fixture).toBe("diff-block");
		expect(parseGalleryRequest(["--fixture", "reporter"]).fixture).toBe("reporter");
		expect(parseGalleryRequest(["--fixture", "sparkline"]).fixture).toBe("sparkline");
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

	test("Renders the sparkline fixture across all variants", () => {
		const output = renderGallery(
			{
				colour: false,
				unicode: true,
			},
			{
				fixture: "sparkline",
				variants: true,
				width: 64,
			},
		);

		expect(output.match(/Sparkline/g)).toHaveLength(4);
		expect(output).toContain("Rising");
		expect(output).toContain("Falling");
		expect(output).toContain("Flat");
		expect(output).toContain("Negative");
		expect(output).toContain("Narrow mixed");
	});

	test("Renders the diff-block fixture across all variants", () => {
		const output = renderGallery(
			{
				colour: false,
				unicode: true,
			},
			{
				fixture: "diff-block",
				variants: true,
				width: 72,
			},
		);

		expect(output.match(/Diff block/g)).toHaveLength(4);
		expect(output).toContain("+ return nextStep;");
		expect(output).toContain("- return currentStep;");
		expect(output).toContain("  const currentStep = getStep();");
	});

	test("Fills diff rows only in colour-enabled gallery variants", () => {
		for (const palette of [
			{
				addedBackground: "\u001b[48;5;22m",
				addedText: "\u001b[38;5;114m",
				theme: "dark",
			},
			{
				addedBackground: "\u001b[48;5;194m",
				addedText: "\u001b[38;5;22m",
				theme: "light",
			},
		]) {
			const output = renderGallery(
				{
					colour: true,
					theme: palette.theme,
					unicode: true,
				},
				{
					fixture: "diff-block",
					variants: true,
					width: 72,
				},
			);

			const currentStart = output.indexOf("Current terminal");
			const noColourStart = output.indexOf("No colour");
			const noUnicodeStart = output.indexOf("No Unicode");
			const plainStart = output.indexOf("Plain");
			const current = output.slice(currentStart, noColourStart);
			const noColour = output.slice(noColourStart, noUnicodeStart);
			const noUnicode = output.slice(noUnicodeStart, plainStart);
			const plain = output.slice(plainStart);

			expect(current).toContain(palette.addedBackground);
			expect(current).toContain(palette.addedText);
			expect(noColour).not.toContain("\u001b[48;");
			expect(noUnicode).toContain(palette.addedBackground);
			expect(plain).not.toContain("\u001b[48;");
		}
	});

	test("Colours sparkline trends only in colour-enabled variants", () => {
		const output = renderGallery(
			{
				colour: true,
				theme: "dark",
				unicode: true,
			},
			{
				fixture: "sparkline",
				variants: true,
				width: 64,
			},
		);

		const currentStart = output.indexOf("Current terminal");
		const noColourStart = output.indexOf("No colour");
		const noUnicodeStart = output.indexOf("No Unicode");
		const plainStart = output.indexOf("Plain");
		const current = output.slice(currentStart, noColourStart);
		const noColour = output.slice(noColourStart, noUnicodeStart);
		const noUnicode = output.slice(noUnicodeStart, plainStart);
		const plain = output.slice(plainStart);
		const risingLine = (section) => section.split("\n").find((line) => line.includes("Rising:"));

		expect(risingLine(current)).toContain("\u001b[");
		expect(risingLine(noColour)).not.toContain("\u001b[");
		expect(risingLine(noUnicode)).toContain("\u001b[");
		expect(risingLine(plain)).not.toContain("\u001b[");
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
		expect(parseGalleryRequest(["--light"]).variant).toBe("current");
		expect(parseGalleryRequest(["--dark"]).variant).toBe("current");
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
		expect(() => parseGalleryRequest(["current", "plain"])).toThrow(
			"Unexpected gallery argument: plain",
		);
		expect(() => parseGalleryRequest(["--section"])).toThrow("Missing value for --section");
		expect(() => parseGalleryRequest(["--fixture", "missing"])).toThrow(
			"Unknown gallery fixture: missing",
		);
		expect(() => parseGalleryRequest(["--profile", "missing"])).toThrow("Unknown profile: missing");
		expect(() => parseGalleryRequest(["--profile=json"])).toThrow(
			"Gallery does not support json output",
		);
		expect(() => parseGalleryRequest(["--json"])).toThrow("Gallery does not support json output");
		expect(() => parseGalleryRequest(["--width", "0"])).toThrow(
			"Gallery width must be a positive integer",
		);
	});
});
