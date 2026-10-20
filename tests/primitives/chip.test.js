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

		expect(output).toBe("\u001b[48;5;22m\u001b[1m\u001b[38;5;114m You \u001b[0m\u001b[0m\u001b[0m");
		expect(stripAnsi(output)).toBe(" You ");
	});

	test("Restores the chip fill, weight and tone after caller-coloured text", () => {
		const output = chip("\u001b[31mred\u001b[0m rest", "user", { colour: true });

		expect(output).toContain(
			"\u001b[31mred\u001b[0m\u001b[48;5;22m\u001b[1m\u001b[38;5;114m rest ",
		);
		expect(stripAnsi(output)).toBe(" red rest ");
	});

	test("Restores each chip style after a label closes it", () => {
		const output = chip("\u001b[31mred\u001b[49mA\u001b[22mB\u001b[39mC", "user", {
			colour: true,
		});

		expect(output).toContain(
			"red\u001b[49m\u001b[48;5;22mA\u001b[22m\u001b[1mB\u001b[39m\u001b[38;5;114mC",
		);
		expect(stripAnsi(output)).toBe(" redABC ");
	});

	test("Falls back to neutral tone for unsupported tones", () => {
		const output = chip("Unknown", "missing", {
			colour: false,
		});

		expect(output).toBe("[Unknown]");
	});
});
