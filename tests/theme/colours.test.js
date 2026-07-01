import { describe, expect, test } from "bun:test";

import {
	chartColours,
	chipColours,
	colourTokens,
	getColourToken,
	getToneColour,
	panelColours,
	promptColours,
	resolveColourValue,
	tableColours,
	terminalColours,
	toneColours,
} from "../../src/index.js";

describe("Colour tokens", () => {
	test("Defines stable semantic colour roles", () => {
		expect(Object.keys(colourTokens).sort()).toEqual([
			"accent",
			"background",
			"border",
			"danger",
			"info",
			"muted",
			"success",
			"surface",
			"surfaceRaised",
			"text",
			"warning",
		]);
	});

	test("Uses hex colour values", () => {
		const hexColour = /^#[\da-f]{6}$/u;

		for (const colour of Object.values(colourTokens)) {
			expect(colour).toMatch(hexColour);
		}
	});

	test("Keeps semantic colour values distinct", () => {
		const values = Object.values(colourTokens);
		const uniqueValues = new Set(values);

		expect(uniqueValues.size).toBe(values.length);
	});

	test("Keeps text colours readable on dark surfaces", () => {
		const pairings = [
			[colourTokens.text, colourTokens.background],
			[colourTokens.muted, colourTokens.background],
			[colourTokens.muted, colourTokens.surface],
			[colourTokens.muted, colourTokens.surfaceRaised],
			[
				resolveColourValue(chipColours.neutral.foreground),
				resolveColourValue(chipColours.neutral.background),
			],
		];

		for (const [foreground, background] of pairings) {
			expect(getContrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
		}
	});

	test("Resolves colour token by name", () => {
		expect(getColourToken("success")).toBe(colourTokens.success);
		expect(getColourToken("missing")).toBeNull();
	});

	test("Resolves token references and direct hex values", () => {
		expect(resolveColourValue("success")).toBe(colourTokens.success);
		expect(resolveColourValue("#123456")).toBe("#123456");
		expect(resolveColourValue("missing")).toBeNull();
	});
});

describe("Tone colours", () => {
	test("Maps result tones to colour token names", () => {
		expect(toneColours).toEqual({
			danger: "danger",
			info: "info",
			muted: "muted",
			success: "success",
			warning: "warning",
		});
	});

	test("Resolves tone colour values", () => {
		expect(getToneColour("danger")).toBe(colourTokens.danger);
		expect(getToneColour("missing")).toBeNull();
	});
});

describe("Visual token groups", () => {
	test("Defines terminal chrome colours", () => {
		expect(resolveColourValue(terminalColours.background)).toBe(colourTokens.background);
		expect(resolveColourValue(terminalColours.border)).toBe(colourTokens.border);
		expect(resolveColourValue(terminalColours.trafficLights.close)).toBe(colourTokens.danger);
	});

	test("Defines chip foreground and background pairs", () => {
		expect(Object.keys(chipColours).sort()).toEqual([
			"agent",
			"danger",
			"info",
			"neutral",
			"success",
			"user",
			"warning",
		]);

		for (const token of Object.values(chipColours)) {
			expect(resolveColourValue(token.background)).toMatch(/^#[\da-f]{6}$/u);
			expect(resolveColourValue(token.foreground)).toMatch(/^#[\da-f]{6}$/u);
		}
	});

	test("Defines panel, table, chart, and prompt groups", () => {
		expect(resolveColourValue(panelColours.background)).toBe(colourTokens.surface);
		expect(resolveColourValue(tableColours.header)).toBe(colourTokens.muted);
		expect(resolveColourValue(chartColours.barPositive)).toBe(colourTokens.success);
		expect(resolveColourValue(promptColours.active)).toBe(colourTokens.success);
	});
});

/**
 * Calculate WCAG contrast ratio for two hex colours.
 *
 * @param  {string}  foreground
 *     Foreground hex colour.
 * @param  {string}  background
 *     Background hex colour.
 * @returns  {number}
 *     Contrast ratio between the two colours.
 */
function getContrastRatio(foreground, background) {
	const foregroundLuminance = getRelativeLuminance(foreground);
	const backgroundLuminance = getRelativeLuminance(background);
	const lightest = Math.max(foregroundLuminance, backgroundLuminance);
	const darkest = Math.min(foregroundLuminance, backgroundLuminance);

	return (lightest + 0.05) / (darkest + 0.05);
}

/**
 * Calculate relative luminance for a hex colour.
 *
 * @param  {string}  colour
 *     Hex colour to measure.
 * @returns  {number}
 *     Relative luminance from 0 to 1.
 */
function getRelativeLuminance(colour) {
	const [red, green, blue] = [1, 3, 5].map((start) => {
		const channel = Number.parseInt(colour.slice(start, start + 2), 16) / 255;

		if (channel <= 0.03928) {
			return channel / 12.92;
		}

		return ((channel + 0.055) / 1.055) ** 2.4;
	});

	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
