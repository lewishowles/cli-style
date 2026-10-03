import { describe, expect, test } from "bun:test";

import { foreground, profiles, quoteBlock, stripAnsi } from "../../src/index.js";

describe("quoteBlock", () => {
	test("Keeps the marker beside wrapped and blank output lines", () => {
		const output = quoteBlock(
			{
				lines: ["one two three four", "", "done"],
				title: "Command output",
				width: 12,
			},
			{
				colour: false,
				profile: profiles.PLAIN,
				unicode: false,
			},
		);

		expect(output).toBe("Command output\n| one two\n| three four\n| \n| done");
	});

	test("Uses an uncoloured ASCII marker in plain and CI output", () => {
		for (const profile of [profiles.PLAIN, profiles.CI]) {
			const output = quoteBlock(
				{ lines: ["one long line that wraps"], title: "Output", width: 12 },
				{ colour: true, profile, unicode: true },
			);

			expect(output).toBe("Output\n| one long\n| line that\n| wraps");
			expect(output).not.toContain("\u001b[");
		}
	});

	test("Colours only the Unicode marker for human output", () => {
		const output = quoteBlock(
			{ lines: ["First", "Second"], title: "Output" },
			{ colour: true, profile: profiles.HUMAN, theme: "dark", unicode: true },
		);

		expect(stripAnsi(output)).toBe("Output\n│ First\n│ Second");
		expect(output).toContain(foreground("│", "muted", { colour: true, theme: "dark" }));
	});

	test("Mutes the ASCII marker for human output without Unicode", () => {
		const output = quoteBlock(
			{ lines: ["First"], title: "Output" },
			{ colour: true, profile: profiles.HUMAN, theme: "dark", unicode: false },
		);

		expect(stripAnsi(output)).toBe("Output\n| First");
		expect(output).toContain(foreground("|", "muted", { colour: true, theme: "dark" }));
	});

	test("Uses the quote width before the options width", () => {
		const output = quoteBlock(
			{ lines: ["abcdefghij"], width: 8 },
			{ colour: false, profile: profiles.PLAIN, width: 12 },
		);

		expect(output).toBe("| abcdef\n| ghij");
	});

	test("Uses the options width when the quote has none", () => {
		const output = quoteBlock(
			{ lines: ["abcdefghij"] },
			{ colour: false, profile: profiles.PLAIN, width: 8 },
		);

		expect(output).toBe("| abcdef\n| ghij");
	});

	test("Falls back to a total width of 66 for an invalid quote width", () => {
		const output = quoteBlock(
			{ lines: ["x".repeat(65)], width: 0 },
			{ colour: false, profile: profiles.PLAIN, width: 8 },
		);

		expect(output).toBe(`| ${"x".repeat(64)}\n| x`);
	});

	test("Strips ANSI from input before rendering", () => {
		const output = quoteBlock(
			{ lines: ["\u001b[31mFailed\u001b[0m"], title: "\u001b[1mOutput\u001b[0m" },
			{ colour: false, profile: profiles.CI, unicode: false },
		);

		expect(output).toBe("Output\n| Failed");
	});

	test("Keeps JSON input unchanged and returns nothing without string lines", () => {
		const input = { lines: ["One"], title: "Output" };

		expect(quoteBlock(input, { profile: profiles.JSON })).toBe(input);
		expect(quoteBlock({ lines: [null, 3] })).toBe("");
		expect(quoteBlock(null)).toBe("");
	});
});
