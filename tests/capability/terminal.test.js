import { describe, expect, test } from "bun:test";

import { resolveTerminalCapabilities } from "../../src/index.js";

describe("Terminal capability detection", () => {
	test("Uses stream TTY and width when available", () => {
		const capabilities = resolveTerminalCapabilities({
			stdout: {
				columns: 120,
				isTTY: true,
			},
		});

		expect(capabilities.isTty).toBe(true);
		expect(capabilities.colour).toBe(true);
		expect(capabilities.width).toBe(120);
	});

	test("Falls back to non-colour output when stream is not a TTY", () => {
		const capabilities = resolveTerminalCapabilities({
			stdout: {
				columns: 100,
				isTTY: false,
			},
		});

		expect(capabilities.isTty).toBe(false);
		expect(capabilities.colour).toBe(false);
		expect(capabilities.width).toBe(100);
	});

	test("Detects CI from environment", () => {
		const capabilities = resolveTerminalCapabilities({
			env: {
				CI: "true",
			},
		});

		expect(capabilities.isCi).toBe(true);
	});

	test("Disables colour when NO_COLOR is present", () => {
		const capabilities = resolveTerminalCapabilities({
			env: {
				NO_COLOR: "1",
			},
			stdout: {
				isTTY: true,
			},
		});

		expect(capabilities.colour).toBe(false);
	});

	test("Disables colour and Unicode for dumb terminals", () => {
		const capabilities = resolveTerminalCapabilities({
			env: {
				TERM: "dumb",
			},
			stdout: {
				isTTY: true,
			},
		});

		expect(capabilities.isDumb).toBe(true);
		expect(capabilities.colour).toBe(false);
		expect(capabilities.unicode).toBe(false);
	});

	test("Plain flag disables colour and Unicode", () => {
		const capabilities = resolveTerminalCapabilities({
			argv: ["--plain"],
			stdout: {
				isTTY: true,
			},
		});

		expect(capabilities.colour).toBe(false);
		expect(capabilities.unicode).toBe(false);
	});

	test("No-colour flags disable colour", () => {
		expect(
			resolveTerminalCapabilities({
				argv: ["--no-colour"],
				stdout: {
					isTTY: true,
				},
			}).colour,
		).toBe(false);
		expect(
			resolveTerminalCapabilities({
				argv: ["--no-color"],
				stdout: {
					isTTY: true,
				},
			}).colour,
		).toBe(false);
	});

	test("No-unicode flag disables Unicode only", () => {
		const capabilities = resolveTerminalCapabilities({
			argv: ["--no-unicode"],
			stdout: {
				isTTY: true,
			},
		});

		expect(capabilities.colour).toBe(true);
		expect(capabilities.unicode).toBe(false);
	});

	test("Uses stable width fallback", () => {
		const capabilities = resolveTerminalCapabilities({
			stdout: {
				columns: 0,
			},
		});

		expect(capabilities.width).toBe(80);
	});
});
