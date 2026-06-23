import { describe, expect, test } from "bun:test";

import { createCliStyle, divider, profiles, renderGallery, renderHelp, stripAnsi } from "../src/index.js";

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

	test("Exports divider primitive", () => {
		expect(divider({
			colour: false,
			dividerWidth: 4,
		})).toBe("----");
	});

	test("Renders primitive gallery as a string", () => {
		const output = renderGallery();

		expect(output).toContain("CLI style gallery");
		expect(output).toContain("Current terminal -----------------------");
		expect(output).toContain("No colour ------------------------------");
		expect(output).toContain("No Unicode -----------------------------");
		expect(output).toContain("Plain ----------------------------------");
		expect(output).toContain("Primitives");
		expect(output).toContain("[neutral] [info] [success] [warning] [danger]");
		expect(output).toContain("✓ Success tone: success");
		expect(output).toContain("◐ Partial tone: warning");
		expect(output).toContain("– Skipped tone: muted");
		expect(output).toContain("? Unknown tone: muted");
		expect(output).toContain("OK Success tone: success");
		expect(output).toContain("- Skipped tone: muted");
		expect(output).toContain("Package   @lewishowles/components");
	});

	test("Renders coloured primitive gallery when colour is enabled", () => {
		const output = renderGallery({
			colour: true,
			unicode: true,
		});

		expect(output).toContain("\u001b[");
		expect(stripAnsi(output)).toContain(" neutral   info   success   warning   danger ");
		expect(stripAnsi(output)).toContain("✓ Success tone: success");
		expect(stripAnsi(output)).toContain("◐ Partial tone: warning");
		expect(stripAnsi(output)).toContain("OK Success tone: success");
	});
});
