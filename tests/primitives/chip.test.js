import { describe, expect, test } from "bun:test";

import { chip, stripAnsi } from "../../src/index.js";

describe("chip", () => {
	test("Renders plain fallback when colour is disabled", () => {
		const output = chip("You", "user", {
			colour: false,
		});

		expect(output).toBe("[You]");
	});

	test("Renders coloured chip with foreground, background, and bold style", () => {
		const output = chip("You", "user", {
			colour: true,
		});

		expect(output).toBe(
			"\u001b[48;2;31;59;31m\u001b[1m\u001b[38;2;143;223;114m You \u001b[0m\u001b[0m\u001b[0m",
		);
		expect(stripAnsi(output)).toBe(" You ");
	});

	test("Falls back to neutral tone for unsupported tones", () => {
		const output = chip("Unknown", "missing", {
			colour: false,
		});

		expect(output).toBe("[Unknown]");
	});
});
