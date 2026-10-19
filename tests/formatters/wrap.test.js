import { describe, expect, test } from "bun:test";

import { wrapText } from "../../src/formatters/wrap.js";

const escapeCharacter = String.fromCharCode(27);
const bellCharacter = String.fromCharCode(7);

describe("Text wrapping", () => {
	test("Hard-splits text without whitespace", () => {
		expect(wrapText("abcdefgh", 3)).toEqual(["abc", "def", "gh"]);
	});

	test("Starts a new line at CRLF without keeping the carriage return", () => {
		expect(wrapText("a\r\nb", 1)).toEqual(["a", "b"]);
		expect(wrapText("a\r\nb")).toEqual(["a", "b"]);
	});

	test("Wraps before a wide character would pass the limit", () => {
		expect(wrapText("ab界c", 3)).toEqual(["ab", "界c"]);
		expect(wrapText("界a", 1)).toEqual(["界", "a"]);
	});

	test("Keeps coloured wide text and joined emoji intact", () => {
		expect(wrapText("\u001b[31mA界B\u001b[0m", 3)).toEqual(["\u001b[31mA界", "B\u001b[0m"]);
		expect(wrapText("a👍🏽👩‍💻b", 3)).toEqual(["a👍🏽", "👩‍💻b"]);
	});

	test("Preserves ANSI CSI and OSC sequences when wrapping", () => {
		const csiText = `${escapeCharacter}[31mred blue${escapeCharacter}[0m`;
		const oscText = `${escapeCharacter}]8;;https://example.com${bellCharacter}red blue${escapeCharacter}]8;;${bellCharacter}`;
		const oscStText = `${escapeCharacter}]8;;https://example.com${escapeCharacter}\\red blue${escapeCharacter}]8;;${escapeCharacter}\\`;

		expect(wrapText(csiText, 4)).toEqual([
			`${escapeCharacter}[31mred`,
			`blue${escapeCharacter}[0m`,
		]);
		expect(wrapText(oscText, 4)).toEqual([
			`${escapeCharacter}]8;;https://example.com${bellCharacter}red`,
			`blue${escapeCharacter}]8;;${bellCharacter}`,
		]);
		expect(wrapText(oscStText, 4)).toEqual([
			`${escapeCharacter}]8;;https://example.com${escapeCharacter}\\red`,
			`blue${escapeCharacter}]8;;${escapeCharacter}\\`,
		]);
	});

	test("Falls back to the default width for invalid and negative widths", () => {
		const text = "a".repeat(65);
		const expected = ["a".repeat(64), "a"];

		expect(wrapText(text, "invalid")).toEqual(expected);
		expect(wrapText(text, -1)).toEqual(expected);
	});
});
