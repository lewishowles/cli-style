import { describe, expect, test } from "bun:test";

import { resultTypes, status, stripAnsi } from "../../src/index.js";

describe("status", () => {
	test("Renders readable plain status", () => {
		const output = status(resultTypes.SUCCESS, "Build passed", {
			colour: false,
			unicode: true,
		});

		expect(output).toBe("✓ Success Build passed");
	});

	test("Renders ASCII fallback when Unicode is disabled", () => {
		const output = status(resultTypes.SUCCESS, "Build passed", {
			colour: false,
			unicode: false,
		});

		expect(output).toBe("OK Success Build passed");
	});

	test("Renders informational progress status", () => {
		const output = status(resultTypes.INFO, "vue-use", {
			colour: false,
			label: "Syncing external skill",
			unicode: true,
		});

		expect(output).toBe("→ Syncing external skill vue-use");
	});

	test("Renders unchanged no-op status", () => {
		const output = status(resultTypes.UNCHANGED, "already exists", {
			colour: false,
			label: "AGENTS.md",
			unicode: true,
		});

		expect(output).toBe("↪ AGENTS.md already exists");
	});

	test("Renders status without detail text", () => {
		const output = status(resultTypes.WARNING, "", {
			colour: false,
			unicode: true,
		});

		expect(output).toBe("⚠ Warning");
	});

	test("Allows a pattern-specific status label", () => {
		const output = status(resultTypes.SUCCESS, "Delete project", {
			colour: false,
			label: "Confirmed",
		});

		expect(output).toBe("✓ Confirmed Delete project");
	});

	test("Falls back to unknown status", () => {
		const output = status("missing", "State unclear", {
			colour: false,
			unicode: true,
		});

		expect(output).toBe("? Unknown State unclear");
	});

	test("Colours and bolds status prefix when colour is enabled", () => {
		const output = status(resultTypes.FAILED, "Secrets scan", {
			colour: true,
			unicode: false,
		});

		expect(output).toBe("\u001b[1m\u001b[38;2;255;114;114mx Failed\u001b[0m\u001b[0m Secrets scan");
		expect(stripAnsi(output)).toBe("x Failed Secrets scan");
	});
});
