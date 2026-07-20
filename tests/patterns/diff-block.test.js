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

const numberedDiff = {
	lines: [
		{
			text: "src/app.js",
			type: "header",
		},
		{
			newLineNumber: 12,
			text: "const next = true;",
			type: "added",
		},
		{
			oldLineNumber: 12,
			text: "const next = false;",
			type: "removed",
		},
		{
			newLineNumber: 11,
			oldLineNumber: 11,
			text: "const current = true;",
			type: "context",
		},
	],
	path: "src/app.js",
	title: "Release diff",
};

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

	test("Renders stable old and new gutters with a computed change summary", () => {
		const output = diffBlock(numberedDiff, {
			colour: false,
			profile: profiles.CI,
		});

		expect(output).toBe(
			[
				"Release diff (+1 -1)",
				"",
				"Path: src/app.js",
				"",
				"      @@ src/app.js",
				"   12 + const next = true;",
				"12    - const next = false;",
				"11      const current = true;",
			].join("\n"),
		);
	});

	test("Uses the same numbered gutter inside agent diff fences", () => {
		const output = diffBlock(numberedDiff, {
			colour: false,
			profile: profiles.AGENT,
		});

		expect(output).toContain("# Release diff (+1 -1)");
		expect(output).toContain("```diff\n      @@ src/app.js");
		expect(output).toContain("   12 + const next = true;");
	});

	test("Colours numbered summary values without changing its text contract", () => {
		const output = diffBlock(numberedDiff, {
			colour: true,
			profile: profiles.HUMAN,
			theme: "dark",
		});

		expect(output).toContain("\u001b[38;5;114m+1");
		expect(output).toContain("\u001b[38;5;210m-1");
		expect(stripAnsi(output)).toContain("Release diff (+1 -1)");

		for (const profile of [profiles.CI, profiles.PLAIN]) {
			const plainProfileOutput = diffBlock(numberedDiff, {
				colour: true,
				profile,
				theme: "dark",
			});

			expect(plainProfileOutput.split("\n\n")[0]).toBe("Release diff (+1 -1)");
		}
	});

	test("Falls back to the unnumbered block when any code line lacks numbers", () => {
		const output = diffBlock(
			{
				lines: [
					{
						newLineNumber: 12,
						text: "const next = true;",
						type: "added",
					},
					{
						text: "const current = true;",
						type: "context",
					},
				],
				title: "Partial diff",
			},
			{
				colour: false,
				profile: profiles.CI,
			},
		);

		expect(output).toBe(
			["Partial diff", ["+ const next = true;", "  const current = true;"].join("\n")].join("\n\n"),
		);
		expect(output).not.toContain("(+");
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
			diffBlock(numberedDiff, {
				profile: profiles.JSON,
			}),
		).toBe(numberedDiff);
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
