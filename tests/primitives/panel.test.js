import { describe, expect, test } from "bun:test";

import { panel, stripAnsi } from "../../src/index.js";

describe("panel", () => {
	test("Renders a fixed-width panel with a title and padded content", () => {
		const output = panel({
			colour: false,
			lines: ["Short", "Longer detail"],
			panelWidth: 20,
			title: "Info",
		});

		expect(output).toBe(
			[
				"▌                   ",
				"▌  Info             ",
				"▌  Short            ",
				"▌  Longer detail    ",
				"▌                   ",
			].join("\n"),
		);
	});

	test("Renders an ASCII accent when Unicode is disabled", () => {
		const output = panel({
			colour: false,
			lines: ["Configuration file missing"],
			panelWidth: 32,
			title: "Error",
			unicode: false,
		});

		expect(output).toBe(
			[
				"|                               ",
				"|  Error                        ",
				"|  Configuration file missing   ",
				"|                               ",
			].join("\n"),
		);
	});

	test("Omits decoration for the CI profile", () => {
		const output = panel({
			colour: false,
			lines: ["Configuration file missing"],
			profile: "ci",
			title: "Error",
		});

		expect(output).toBe("Error\nConfiguration file missing");
	});

	test("Renders content without a title", () => {
		const output = panel({
			colour: false,
			lines: ["One", "Two"],
			panelWidth: 10,
		});

		expect(output).toBe(["▌         ", "▌  One    ", "▌  Two    ", "▌         "].join("\n"));
	});

	test("Colours the surface and semantic accent", () => {
		const output = panel({
			colour: true,
			lines: ["Configuration file missing"],
			panelWidth: 32,
			title: "Error",
			tone: "danger",
		});

		expect(output).toContain("\u001b[38;5;210m");
		expect(output).toContain("\u001b[38;5;252m");
		expect(output).toContain("\u001b[48;5;234m");
		expect(stripAnsi(output)).toBe(
			[
				"▌                               ",
				"▌  Error                        ",
				"▌  Configuration file missing   ",
				"▌                               ",
			].join("\n"),
		);
	});

	test("Uses a dark body foreground on a light panel surface", () => {
		const output = panel({
			colour: true,
			lines: ["Configuration file missing"],
			panelWidth: 32,
			theme: "light",
			title: "Error",
			tone: "danger",
		});

		expect(output).toContain("\u001b[38;5;238m");
		expect(output).toContain("\u001b[48;5;255m");
		expect(stripAnsi(output)).toContain("Configuration file missing");
	});

	test("Keeps automatic theme panel text terminal-native", () => {
		const output = panel({
			colour: true,
			lines: ["Configuration file missing"],
			panelWidth: 32,
			theme: "auto",
			title: "Error",
		});

		expect(output).not.toContain("\u001b[38;5;");
		expect(output).not.toContain("\u001b[48;5;");
		expect(stripAnsi(output)).toContain("Configuration file missing");
	});
});
