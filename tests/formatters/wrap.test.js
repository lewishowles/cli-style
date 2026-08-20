import { describe, expect, test } from "bun:test";

import { wrapText } from "../../src/formatters/wrap.js";

const escapeCharacter = String.fromCharCode(27);
const bellCharacter = String.fromCharCode(7);

describe("Text wrapping", () => {
	test("Hard-splits text without whitespace", () => {
		expect(wrapText("abcdefgh", 3)).toEqual(["abc", "def", "gh"]);
	});

	test("Preserves ANSI CSI and OSC sequences when wrapping", () => {
		const csiText = `${escapeCharacter}[31mred blue${escapeCharacter}[0m`;
		const oscText = `${escapeCharacter}]8;;https://example.com${bellCharacter}red blue${escapeCharacter}]8;;${bellCharacter}`;

		expect(wrapText(csiText, 4)).toEqual([
			`${escapeCharacter}[31mred`,
			`blue${escapeCharacter}[0m`,
		]);
		expect(wrapText(oscText, 4)).toEqual([
			`${escapeCharacter}]8;;https://example.com${bellCharacter}red`,
			`blue${escapeCharacter}]8;;${bellCharacter}`,
		]);
	});

	test("Falls back to the default width for invalid and negative widths", () => {
		const text = "a".repeat(65);
		const expected = ["a".repeat(64), "a"];

		expect(wrapText(text, "invalid")).toEqual(expected);
		expect(wrapText(text, -1)).toEqual(expected);
	});
});
