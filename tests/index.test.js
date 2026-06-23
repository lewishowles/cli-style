import { describe, expect, test } from "bun:test";

import { createCliStyle, profiles, renderGallery, renderHelp } from "../src/index.js";

describe("Initialisation", () => {
	test("Creates a renderer with default options", () => {
		const ui = createCliStyle();

		expect(ui.options).toEqual({
			colour: false,
			isCi: false,
			isDumb: false,
			isTty: false,
			profile: profiles.HUMAN,
			unicode: true,
			width: 80,
		});
	});

	test("Resolves profile and terminal capabilities from inputs", () => {
		const ui = createCliStyle({
			env: {
				CI: "true",
			},
			stdout: {
				columns: 120,
				isTTY: true,
			},
		});

		expect(ui.options.profile).toBe(profiles.CI);
		expect(ui.options.colour).toBe(true);
		expect(ui.options.isCi).toBe(true);
		expect(ui.options.width).toBe(120);
	});

	test("Allows resolved capability options to be overridden", () => {
		const ui = createCliStyle({
			colour: false,
			stdout: {
				isTTY: true,
			},
			unicode: false,
			width: 64,
		});

		expect(ui.options.colour).toBe(false);
		expect(ui.options.unicode).toBe(false);
		expect(ui.options.width).toBe(64);
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
