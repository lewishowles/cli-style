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

	test("Forces colour when FORCE_COLOR is present and not zero", () => {
		expect(
			resolveTerminalCapabilities({
				env: {
					FORCE_COLOR: "1",
				},
				stdout: {
					isTTY: false,
				},
			}).colour,
		).toBe(true);
		expect(
			resolveTerminalCapabilities({
				env: {
					FORCE_COLOR: "",
				},
				stdout: {
					isTTY: false,
				},
			}).colour,
		).toBe(true);
	});

	test("Does not force colour when FORCE_COLOR is zero", () => {
		const capabilities = resolveTerminalCapabilities({
			env: {
				FORCE_COLOR: "0",
			},
			stdout: {
				isTTY: false,
			},
		});

		expect(capabilities.colour).toBe(false);
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
				FORCE_COLOR: "1",
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
				FORCE_COLOR: "1",
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
			env: {
				FORCE_COLOR: "1",
			},
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
				env: {
					FORCE_COLOR: "1",
				},
				stdout: {
					isTTY: true,
				},
			}).colour,
		).toBe(false);
		expect(
			resolveTerminalCapabilities({
				argv: ["--no-color"],
				env: {
					FORCE_COLOR: "1",
				},
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

	test("Resolves COLORFGBG background slots", () => {
		expect(
			resolveTerminalCapabilities({
				env: {
					COLORFGBG: "15;0",
					COLORTERM: "truecolor",
					TERM_PROGRAM: "vscode",
				},
			}).theme,
		).toBe("dark");
		expect(
			resolveTerminalCapabilities({
				env: {
					COLORFGBG: "0;15",
					COLORTERM: "truecolor",
					TERM_PROGRAM: "vscode",
				},
			}).theme,
		).toBe("light");
	});

	test("Falls back to dark theme when COLORFGBG is unavailable or ambiguous", () => {
		expect(resolveTerminalCapabilities().theme).toBe("dark");
		expect(
			resolveTerminalCapabilities({
				env: {
					COLORFGBG: "15;default",
				},
			}).theme,
		).toBe("dark");
	});

	test("Uses COLORTERM and TERM_PROGRAM as best-effort theme signals", () => {
		expect(
			resolveTerminalCapabilities({
				env: {
					COLORTERM: "truecolor",
				},
			}).theme,
		).toBe("dark");
		expect(
			resolveTerminalCapabilities({
				env: {
					TERM_PROGRAM: "Apple_Terminal",
				},
			}).theme,
		).toBe("dark");
	});

	test("Resolves an automatic theme option through terminal signals", () => {
		expect(
			resolveTerminalCapabilities({
				env: {
					TERM_PROGRAM: "vscode",
				},
				theme: "auto",
			}).theme,
		).toBe("dark");
	});

	test("Prefers explicit theme flags and options over COLORFGBG", () => {
		expect(
			resolveTerminalCapabilities({
				argv: ["--dark"],
				env: {
					COLORFGBG: "0;15",
					COLORTERM: "truecolor",
					TERM_PROGRAM: "vscode",
				},
				theme: "light",
			}).theme,
		).toBe("dark");
		expect(
			resolveTerminalCapabilities({
				env: {
					COLORFGBG: "15;0",
					COLORTERM: "truecolor",
					TERM_PROGRAM: "vscode",
				},
				theme: "light",
			}).theme,
		).toBe("light");
	});
});
