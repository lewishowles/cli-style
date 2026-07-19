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
	themes,
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

	test("Resolves approved light and dark ANSI-256 palettes", () => {
		expect(getColourToken("success", { theme: themes.DARK })).toBe("ansi-256:114");
		expect(getColourToken("warning", { theme: themes.LIGHT })).toBe("ansi-256:94");
		expect(getColourToken("surface", { theme: themes.DARK })).toBe("ansi-256:234");
		expect(getColourToken("surface", { theme: themes.LIGHT })).toBe("ansi-256:255");
	});

	test("Uses terminal defaults for the safe automatic palette", () => {
		expect(getColourToken("text", { theme: themes.AUTO })).toBe("default-foreground");
		expect(getColourToken("success", { theme: themes.AUTO })).toBe("default-foreground");
		expect(getColourToken("surface", { theme: themes.AUTO })).toBe("default-background");
	});

	test("Resolves token references and direct hex values", () => {
		expect(resolveColourValue("success", { theme: themes.LIGHT })).toBe("ansi-256:28");
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
		expect(getToneColour("danger", { theme: themes.DARK })).toBe("ansi-256:210");
		expect(getToneColour("missing")).toBeNull();
	});
});

describe("Visual token groups", () => {
	test("Uses semantic token names across visual groups", () => {
		expect(terminalColours.background).toBe("background");
		expect(terminalColours.trafficLights.close).toBe("danger");
		expect(chipColours.success.background).toBe("chipSuccess");
		expect(panelColours.background).toBe("surface");
		expect(tableColours.primaryText).toBe("text");
		expect(chartColours.barPositive).toBe("success");
		expect(promptColours.active).toBe("success");
	});
});
