import { describe, expect, test } from "bun:test";

import { panel, stripAnsi } from "../../src/index.js";

describe("panel", () => {
	test("Renders a fixed-width panel with a title and padded content", () => {
		const output = panel({
			colour: false,
			lines: ["Short", "Longer detail"],
			width: 20,
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
			width: 32,
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
			width: 10,
		});

		expect(output).toBe(["▌         ", "▌  One    ", "▌  Two    ", "▌         "].join("\n"));
	});

	test("Colours the surface and semantic accent", () => {
		const output = panel({
			colour: true,
			lines: ["Configuration file missing"],
			width: 32,
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
			width: 32,
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
			width: 32,
			theme: "auto",
			title: "Error",
		});

		expect(output).not.toContain("\u001b[38;5;");
		expect(output).not.toContain("\u001b[48;5;");
		expect(stripAnsi(output)).toContain("Configuration file missing");
	});

	test("Wraps long titles and details within a plain panel width", () => {
		const width = 24;
		const title = "A title with several words";
		const detail = "A detail line with several words";

		const output = panel({
			colour: false,
			lines: [detail],
			title,
			width,
		});

		for (const word of `${title} ${detail}`.split(" ")) {
			expect(output).toContain(word);
		}

		expect(output.split("\n").every((line) => line.length <= width)).toBe(true);
	});

	test("Wraps long titles and details within a coloured panel width", () => {
		const width = 24;
		const title = "A title with several words";
		const detail = "A detail line with several words";

		const output = panel({
			colour: true,
			lines: [detail],
			title,
			width,
		});

		const visibleOutput = stripAnsi(output);

		for (const word of `${title} ${detail}`.split(" ")) {
			expect(visibleOutput).toContain(word);
		}

		expect(visibleOutput.split("\n").every((line) => line.length <= width)).toBe(true);
	});

	test("Keeps panels within the minimum width", () => {
		const minimumWidth = 6;

		for (const width of [1, 4, 5, minimumWidth]) {
			const output = panel({
				colour: false,
				lines: ["A long line"],
				title: "Title",
				width,
			});

			expect(output.split("\n").every((line) => line.length <= minimumWidth)).toBe(true);
		}
	});
});
