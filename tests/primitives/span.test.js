import { describe, expect, test } from "bun:test";

import { hint, span, stripAnsi } from "../../src/index.js";

describe("span", () => {
	test("Returns plain text when colour is disabled", () => {
		const output = span("npm run docs:readme", "info", {
			colour: false,
		});

		expect(output).toBe("npm run docs:readme");
	});

	test("Colours and weights inline text", () => {
		const output = span("npm run docs:readme", "info", {
			colour: true,
		});

		expect(output).toContain("\u001b[1m");
		expect(output).toContain("\u001b[38;5;117m");
		expect(stripAnsi(output)).toBe("npm run docs:readme");
	});

	test("Composes inside hint messages", () => {
		const command = span("npm run docs:readme", "info", {
			colour: true,
		});

		const output = hint(`Run ${command} before release.`, {
			colour: true,
		});

		expect(output).toContain("\u001b[38;5;117m");
		expect(stripAnsi(output)).toBe("i Hint: Run npm run docs:readme before release.");
	});
});
