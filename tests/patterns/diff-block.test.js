import { describe, expect, test } from "bun:test";

import { diffBlock, profiles, stripAnsi } from "../../src/index.js";

const diff = {
	lines: [
		{
			text: "src/app.js",
			type: "header",
		},
		{
			text: "const next = true;",
			type: "added",
		},
		{
			text: "const next = false;",
			type: "removed",
		},
		{
			text: "const current = true;",
			type: "context",
		},
	],
	path: "src/app.js",
	title: "Release diff",
};

const plainOutput = [
	"Release diff",
	"",
	"Path: src/app.js",
	"",
	"@@ src/app.js",
	"+ const next = true;",
	"- const next = false;",
	"  const current = true;",
].join("\n");

describe("diffBlock", () => {
	test("Renders every line type with stable prefixes across text profiles", () => {
		for (const profile of [profiles.HUMAN, profiles.DIAGNOSTIC, profiles.CI, profiles.PLAIN]) {
			expect(
				diffBlock(diff, {
					colour: false,
					profile,
					unicode: false,
				}),
			).toBe(plainOutput);
		}
	});

	test("Uses colour to reinforce line prefixes without changing text", () => {
		const output = diffBlock(diff, {
			colour: true,
			profile: profiles.HUMAN,
			theme: "dark",
		});

		expect(stripAnsi(output)).toBe(plainOutput);
		expect(output).toContain("\u001b[");
	});

	test("Fills added and removed rows with theme-matched colours", () => {
		const themes = [
			{
				addedBackground: "\u001b[48;5;22m",
				addedText: "\u001b[38;5;114m",
				removedBackground: "\u001b[48;5;52m",
				removedText: "\u001b[38;5;210m",
				theme: "dark",
			},
			{
				addedBackground: "\u001b[48;5;194m",
				addedText: "\u001b[38;5;22m",
				removedBackground: "\u001b[48;5;224m",
				removedText: "\u001b[38;5;124m",
				theme: "light",
			},
		];

		for (const profile of [profiles.HUMAN, profiles.DIAGNOSTIC]) {
			for (const palette of themes) {
				const output = diffBlock(diff, {
					colour: true,
					profile,
					theme: palette.theme,
				});

				expect(output).toContain(palette.addedBackground);
				expect(output).toContain(palette.addedText);
				expect(output).toContain(palette.removedBackground);
				expect(output).toContain(palette.removedText);
				expect(stripAnsi(output)).toBe(plainOutput);
			}
		}
	});

	test("Keeps row backgrounds out of CI, plain, agent, and colour-disabled output", () => {
		for (const profile of [profiles.CI, profiles.PLAIN, profiles.AGENT]) {
			const output = diffBlock(diff, {
				colour: true,
				profile,
				theme: "dark",
			});

			expect(output).not.toContain("\u001b[48;");
		}

		const output = diffBlock(diff, {
			colour: false,
			profile: profiles.HUMAN,
			theme: "dark",
		});

		expect(output).toBe(plainOutput);
		expect(output).not.toContain("\u001b[");
	});

	test("Uses an optional heading and path around an agent diff fence", () => {
		const output = diffBlock(diff, {
			colour: false,
			profile: profiles.AGENT,
		});

		expect(output).toBe(
			[
				"# Release diff",
				"",
				"Path: src/app.js",
				"",
				"```diff",
				"@@ src/app.js",
				"+ const next = true;",
				"- const next = false;",
				"  const current = true;",
				"```",
			].join("\n"),
		);
	});

	test("Returns structured input unchanged for the JSON profile", () => {
		expect(
			diffBlock(diff, {
				profile: profiles.JSON,
			}),
		).toBe(diff);
	});

	test("Ignores invalid lines and preserves valid blank lines", () => {
		const output = diffBlock(
			{
				lines: [
					null,
					{
						text: "",
						type: "context",
					},
					{
						text: "ignored",
						type: "unknown",
					},
					{
						text: 42,
						type: "added",
					},
				],
			},
			{
				colour: false,
			},
		);

		expect(output).toBe("  ");
		expect(diffBlock({ lines: [null, { text: "ignored", type: "unknown" }] })).toBe("");
		expect(diffBlock(null)).toBe("");
		expect(diffBlock([])).toBe("");
	});

	test("Strips terminal styling from diff content", () => {
		const output = diffBlock(
			{
				lines: [
					{
						text: "\u001b[31munsafe\u001b[0m",
						type: "removed",
					},
				],
			},
			{
				colour: false,
			},
		);

		expect(output).toBe("- unsafe");
	});
});
