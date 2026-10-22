import { describe, expect, test } from "bun:test";

import { background, foreground, stripAnsi, style } from "../../src/index.js";
import {
	expandTabs,
	padVisible,
	restoreStyles,
	sliceVisible,
	visibleWidth,
} from "../../src/formatters/ansi.js";

describe("Tab expansion", () => {
	test("Counts wide text but ignores colour and link codes at each line's tab stops", () => {
		const linkOpen = "\u001b]8;;https://example.com\u0007";
		const linkClose = "\u001b]8;;\u0007";
		const input = `A\u001b[31m界\u001b[0m\tB\n${linkOpen}Go${linkClose}\tC`;

		expect(expandTabs(input)).toBe(`A\u001b[31m界\u001b[0m B\n${linkOpen}Go${linkClose}  C`);
	});
});

describe("ANSI foreground colour", () => {
	test("Applies dark semantic foreground colour when enabled", () => {
		const output = foreground("Passed", "success", {
			colour: true,
			theme: "dark",
		});

		expect(output).toBe("\u001b[38;5;114mPassed\u001b[0m");
	});

	test("Uses the terminal foreground for automatic text", () => {
		const output = foreground("Text", "text", {
			colour: true,
		});

		expect(output).toBe("\u001b[39mText\u001b[0m");
	});

	test("Applies direct hex foreground colour when enabled", () => {
		const output = foreground("Value", "#123456", {
			colour: true,
		});

		expect(output).toBe("\u001b[38;2;18;52;86mValue\u001b[0m");
	});

	test("Returns original text when colour is disabled", () => {
		const output = foreground("Passed", "success", {
			colour: false,
		});

		expect(output).toBe("Passed");
	});

	test("Returns original text for unsupported colour", () => {
		const output = foreground("Passed", "missing", {
			colour: true,
		});

		expect(output).toBe("Passed");
	});
});

describe("ANSI background colour", () => {
	test("Applies light semantic background colour when enabled", () => {
		const output = background("You", "success", {
			colour: true,
			theme: "light",
		});

		expect(output).toBe("\u001b[48;5;28mYou\u001b[0m");
	});

	test("Uses the terminal background for automatic surfaces", () => {
		const output = background("You", "surface", {
			colour: true,
			theme: "auto",
		});

		expect(output).toBe("\u001b[49mYou\u001b[0m");
	});
});

describe("ANSI styles", () => {
	test("Applies supported style when colour is enabled", () => {
		const output = style("Heading", "bold", {
			colour: true,
		});

		expect(output).toBe("\u001b[1mHeading\u001b[0m");
	});

	test("Returns original text when style is unsupported", () => {
		const output = style("Heading", "missing", {
			colour: true,
		});

		expect(output).toBe("Heading");
	});
});

describe("ANSI style restoration", () => {
	test("Restores every given style after each full reset", () => {
		const stylesToRestore = [
			style("", "bold", { colour: true }),
			foreground("", "warning", { colour: true }),
		];

		expect(restoreStyles("A\u001b[0mB\u001b[0mC", stylesToRestore)).toBe(
			"A\u001b[0m\u001b[1m\u001b[38;5;215mB\u001b[0m\u001b[1m\u001b[38;5;215mC",
		);
	});

	test("Restores styles after a full reset without an explicit zero", () => {
		expect(restoreStyles("A\u001b[mB", [style("", "bold", { colour: true })])).toBe(
			"A\u001b[m\u001b[1mB",
		);
	});

	test("Leaves text without a full reset unchanged", () => {
		expect(restoreStyles("A\u001b[31mB", [style("", "bold", { colour: true })])).toBe(
			"A\u001b[31mB",
		);
	});

	test("Restores only the outer style switched off by each targeted close", () => {
		const stylesToRestore = [
			background("", "#123456", { colour: true }),
			style("", "bold", { colour: true }),
			style("", "dim", { colour: true }),
			foreground("", "#abcdef", { colour: true }),
		];

		expect(restoreStyles("A\u001b[49mB\u001b[22mC\u001b[39mD", stylesToRestore)).toBe(
			"A\u001b[49m\u001b[48;2;18;52;86mB\u001b[22m\u001b[1m\u001b[2mC\u001b[39m\u001b[38;2;171;205;239mD",
		);
	});

	test("Leaves a foreign foreground active after a background close", () => {
		const stylesToRestore = [
			background("", "#123456", { colour: true }),
			foreground("", "#abcdef", { colour: true }),
		];

		expect(restoreStyles("\u001b[31m\u001b[44mX\u001b[49mY\u001b[39mZ", stylesToRestore)).toBe(
			"\u001b[31m\u001b[44mX\u001b[49m\u001b[48;2;18;52;86mY\u001b[39m\u001b[38;2;171;205;239mZ",
		);
	});

	test("Restores basic and bright ANSI colours after their matching closes", () => {
		const stylesToRestore = ["\u001b[31m\u001b[0m", "\u001b[104m\u001b[0m"];

		expect(restoreStyles("A\u001b[39mB\u001b[49mC", stylesToRestore)).toBe(
			"A\u001b[39m\u001b[31mB\u001b[49m\u001b[104mC",
		);
	});
});

describe("ANSI stripping", () => {
	test("Removes ANSI escape sequences", () => {
		const output = foreground("Passed", "success", {
			colour: true,
		});

		expect(stripAnsi(output)).toBe("Passed");
	});

	test("Removes terminal hyperlinks while keeping their link text", () => {
		expect(stripAnsi("\u001b]8;;https://example.com\u0007link\u001b]8;;\u0007")).toBe("link");
		expect(stripAnsi("\u001b]8;;https://example.com\u001b\\link\u001b]8;;\u001b\\")).toBe("link");
	});
});

describe("Visible width", () => {
	test("Ignores ANSI CSI and OSC sequences", () => {
		expect(visibleWidth("\u001b[31mred\u001b[0m")).toBe(3);
		expect(visibleWidth("\u001b]8;;https://example.com\u0007link\u001b]8;;\u0007")).toBe(4);
	});

	test("Counts wide characters and joined emoji as two columns", () => {
		expect(visibleWidth("A界Ｂ")).toBe(5);
		expect(visibleWidth("👍🏽👩‍💻")).toBe(4);
	});

	test("Counts text symbols as one column unless emoji presentation is requested", () => {
		expect(visibleWidth("©™")).toBe(2);
		expect(visibleWidth("❤️")).toBe(2);
		expect(visibleWidth("1️⃣🇬🇧")).toBe(4);
	});

	test("Counts standalone marks and joiners as zero columns", () => {
		expect(visibleWidth("\u0301\u200d")).toBe(0);
	});
});

describe("Visible padding", () => {
	test("Pads coloured and wide text to the requested terminal width", () => {
		const value = "\u001b[31m界\u001b[0m";

		expect(padVisible(value, 4)).toBe(`${value}  `);
		expect(visibleWidth(padVisible(value, 4))).toBe(4);
	});

	test("Leaves text unchanged when it already fills the requested width", () => {
		expect(padVisible("👍🏽", 1)).toBe("👍🏽");
	});
});

describe("Visible slicing", () => {
	test("Stops before a wide character that crosses the edge", () => {
		expect(sliceVisible("A界B", 2)).toEqual({ head: "A", tail: "界B" });
		expect(sliceVisible("👍🏽B", 2)).toEqual({ head: "👍🏽", tail: "B" });
	});

	test("Closes and reopens colour across a split", () => {
		const value = "\u001b[31mA界B\u001b[0m";

		expect(sliceVisible(value, 2)).toEqual({
			head: "\u001b[31mA\u001b[0m",
			tail: "\u001b[31m界B\u001b[0m",
		});
	});

	test("Closes and reopens a terminal hyperlink at the cut", () => {
		const value = "\u001b]8;;https://example.com\u0007link\u001b]8;;\u0007";

		expect(sliceVisible(value, 2)).toEqual({
			head: "\u001b]8;;https://example.com\u0007li\u001b]8;;\u0007",
			tail: "\u001b]8;;https://example.com\u0007nk\u001b]8;;\u0007",
		});
	});

	test("Closes and reopens coloured link text that ends with a string terminator", () => {
		const value = "\u001b[31m\u001b]8;;https://example.com\u001b\\link\u001b]8;;\u001b\\\u001b[0m";

		expect(sliceVisible(value, 2)).toEqual({
			head: "\u001b[31m\u001b]8;;https://example.com\u001b\\li\u001b]8;;\u001b\\\u001b[0m",
			tail: "\u001b[31m\u001b]8;;https://example.com\u001b\\nk\u001b]8;;\u001b\\\u001b[0m",
		});
	});

	test("Closes and reopens a terminal hyperlink with ID parameters", () => {
		const value = "\u001b]8;id=x;https://example.com\u0007link\u001b]8;;\u0007";

		expect(sliceVisible(value, 2)).toEqual({
			head: "\u001b]8;id=x;https://example.com\u0007li\u001b]8;;\u0007",
			tail: "\u001b]8;id=x;https://example.com\u0007nk\u001b]8;;\u0007",
		});
	});
});
