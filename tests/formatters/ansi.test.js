import { describe, expect, test } from "bun:test";

import { background, foreground, stripAnsi, style } from "../../src/index.js";

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

describe("ANSI stripping", () => {
	test("Removes ANSI escape sequences", () => {
		const output = foreground("Passed", "success", {
			colour: true,
		});

		expect(stripAnsi(output)).toBe("Passed");
	});
});
