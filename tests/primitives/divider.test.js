import { describe, expect, test } from "bun:test";

import { divider, stripAnsi } from "../../src/index.js";
import { visibleWidth } from "../../src/formatters/ansi.js";

describe("divider", () => {
	test("Expands a tabbed label before sizing the rule", () => {
		const output = divider({ dividerWidth: 12, label: "A\tB" });

		expect(output).toBe("A   B ------");
		expect(visibleWidth(output)).toBe(12);
	});

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

	test("Keeps a coloured wide label within the requested width", () => {
		const plain = divider({ colour: false, dividerWidth: 12, label: "Label" });
		const styled = divider({ colour: false, dividerWidth: 12, label: "\u001b[31m界面X\u001b[0m" });

		expect(stripAnsi(styled).replace("界面X", "Label")).toBe(plain);
		expect(visibleWidth(styled)).toBe(12);
	});

	test("Colours the divider when colour is enabled", () => {
		const output = divider({
			colour: true,
			dividerWidth: 8,
		});

		expect(output).toBe("\u001b[38;5;239m--------\u001b[0m");
		expect(stripAnsi(output)).toBe("--------");
	});

	test("Colours labelled divider parts separately", () => {
		const output = divider({
			colour: true,
			dividerWidth: 20,
			label: "Primitives",
		});

		expect(output).toBe("\u001b[38;5;117mPrimitives\u001b[0m \u001b[38;5;239m---------\u001b[0m");
		expect(stripAnsi(output)).toBe("Primitives ---------");
	});
});
