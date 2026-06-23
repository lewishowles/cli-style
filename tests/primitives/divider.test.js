import { describe, expect, test } from "bun:test";

import { divider, stripAnsi } from "../../src/index.js";

describe("divider", () => {
	test("Renders a plain divider", () => {
		const output = divider({
			colour: false,
		});

		expect(output).toBe("----------------------------------------");
	});

	test("Renders a custom-width divider", () => {
		const output = divider({
			colour: false,
			dividerWidth: 8,
		});

		expect(output).toBe("--------");
	});

	test("Renders a custom-character divider", () => {
		const output = divider({
			character: "=",
			colour: false,
			dividerWidth: 8,
		});

		expect(output).toBe("========");
	});

	test("Renders a labelled divider", () => {
		const output = divider({
			colour: false,
			dividerWidth: 20,
			label: "Primitives",
		});

		expect(output).toBe("Primitives ---------");
	});

	test("Colours the divider when colour is enabled", () => {
		const output = divider({
			colour: true,
			dividerWidth: 8,
		});

		expect(output).toBe("\u001b[38;2;42;58;66m--------\u001b[0m");
		expect(stripAnsi(output)).toBe("--------");
	});

	test("Colours labelled divider parts separately", () => {
		const output = divider({
			colour: true,
			dividerWidth: 20,
			label: "Primitives",
		});

		expect(output).toBe(
			"\u001b[38;2;139;189;255mPrimitives\u001b[0m \u001b[38;2;42;58;66m---------\u001b[0m",
		);
		expect(stripAnsi(output)).toBe("Primitives ---------");
	});
});
