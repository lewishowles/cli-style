import { describe, expect, test } from "bun:test";

import { panel, resultTypes, rowGroup, status, stripAnsi } from "../../src/index.js";
import { visibleWidth } from "../../src/formatters/ansi.js";

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

	test("Renders 80 columns wide when no width is given", () => {
		const output = panel({ colour: false, lines: ["Short"], title: "Info" });

		expect(output.split("\n").map(visibleWidth)).toEqual([80, 80, 80, 80]);
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

	test("Pads coloured status and row group lines to the panel width", () => {
		const width = 24;
		const statusLine = status(resultTypes.SUCCESS, "Done", { colour: true });

		const rows = rowGroup({
			colour: true,
			rows: [
				{ label: "Source", value: "main" },
				{ label: "Checks", value: "unit" },
			],
		});

		const output = panel({ colour: true, lines: [statusLine, rows], width });

		expect(output.split("\n").map(visibleWidth)).toEqual([width, width, width, width, width]);
		expect(stripAnsi(output)).toContain("▌  ✓ Success Done");
		expect(stripAnsi(output)).toContain("▌  Source  main");
		expect(stripAnsi(output)).toContain("▌  Checks  unit");
	});

	test("Switches the panel background, text colour and title bold back on after coloured text inside a line", () => {
		const statusLine = status(resultTypes.SUCCESS, "Done", { colour: true });

		const rows = rowGroup({
			colour: true,
			rows: [
				{ label: "Source", value: "main", valueColour: "success" },
				{ label: "Checks", value: "unit", valueColour: "success" },
			],
		});

		const options = { colour: true, lines: [statusLine, rows], title: statusLine, width: 32 };
		const output = panel(options);
		const outputLines = output.split("\n");
		const fullReset = "\u001b[0m";
		const bodyStyle = "\u001b[48;5;234m\u001b[38;5;252m";

		// The title and the first body line both hold the status line; only the title line
		// switches bold back on as well.
		for (const [index, sourceLine] of [statusLine, statusLine, ...rows.split("\n")].entries()) {
			const panelLine = outputLines[index + 1];
			const restoredStyle = `${fullReset}${bodyStyle}${index === 0 ? "\u001b[1m" : ""}`;
			const innerResetCount = sourceLine.split(fullReset).length - 1;

			expect(panelLine.split(restoredStyle).length - 1).toBe(innerResetCount);

			if (index > 0) {
				expect(panelLine).not.toContain(`${fullReset}${bodyStyle}\u001b[1m`);
			}
		}

		expect(stripAnsi(output)).toBe(
			panel({
				...options,
				colour: false,
				lines: [stripAnsi(statusLine), stripAnsi(rows)],
				title: stripAnsi(statusLine),
			}),
		);
	});

	test("Switches the panel colours back on after coloured text that ends with the short reset", () => {
		const shortReset = "\u001b[m";
		const bodyStyle = "\u001b[48;5;234m\u001b[38;5;252m";
		const output = panel({ colour: true, lines: [`\u001b[31mred${shortReset} text`], width: 32 });

		expect(output).toContain(`${shortReset}${bodyStyle} text`);
	});

	test("Restores only the panel background after foreign text closes its background", () => {
		const output = panel({
			colour: true,
			lines: ["\u001b[31m\u001b[44mX\u001b[49mY\u001b[39m rest"],
			width: 32,
		});

		expect(output).toContain("X\u001b[49m\u001b[48;5;234mY\u001b[39m\u001b[38;5;252m rest");
	});

	test("Restores the panel title weight after foreign text closes bold", () => {
		const output = panel({
			colour: true,
			lines: ["Body"],
			title: "\u001b[1mTitle\u001b[22m rest",
			width: 32,
		});

		expect(output.split("\n")[1]).toContain("Title\u001b[22m\u001b[1m rest");
	});

	test("Pads wide characters by the columns they fill", () => {
		const width = 12;
		const output = panel({ colour: false, lines: ["漢字"], width });

		expect(stripAnsi(output).split("\n")[1]).toBe("▌  漢字     ");
		expect(output.split("\n").map(visibleWidth)).toEqual([width, width, width]);
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
