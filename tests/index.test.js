import { describe, expect, test } from "bun:test";

import { createCliStyle, profiles, renderGallery, renderHelp } from "../src/index.js";

describe("Initialisation", () => {
	test("Creates a renderer with default options", () => {
		const ui = createCliStyle();

		expect(ui.options).toEqual({
			colour: "auto",
			profile: profiles.HUMAN,
			unicode: "auto",
			width: 80,
		});
	});

	test("Allows renderer options to be overridden", () => {
		const ui = createCliStyle({
			profile: profiles.CI,
			width: 120,
		});

		expect(ui.options.profile).toBe(profiles.CI);
		expect(ui.options.width).toBe(120);
	});
});

describe("Render contracts", () => {
	test("Renders CLI help as a string", () => {
		const output = renderHelp();

		expect(output).toContain("Usage:");
		expect(output).toContain("cli-style gallery");
	});

	test("Renders gallery placeholder as a string", () => {
		const output = renderGallery();

		expect(output).toContain("CLI style gallery");
		expect(output).toContain("Status: pending");
	});
});
