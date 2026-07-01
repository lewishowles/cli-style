import { describe, expect, test } from "bun:test";

import { commandResult, profiles, resultTypes } from "../../src/index.js";

describe("commandResult", () => {
	test("Renders successful command metadata and details", () => {
		const output = commandResult(
			{
				command: "bun run test:unit",
				details: ["111 tests passed", "Log saved to .agent/diagnostics/test-unit.log"],
				duration: "250 ms",
				exitCode: 0,
				result: resultTypes.SUCCESS,
				summary: "Unit tests passed",
			},
			{
				colour: false,
			},
		);

		expect(output).toBe(
			[
				"Command result",
				"",
				"✓ Success Unit tests passed",
				"",
				"Command    bun run test:unit",
				"Exit code  0",
				"Duration   250 ms",
				"",
				"Details",
				"- 111 tests passed",
				"- Log saved to .agent/diagnostics/test-unit.log",
			].join("\n"),
		);
	});

	test("Renders failed command output with ASCII symbols", () => {
		const output = commandResult(
			{
				command: "bun run build",
				exitCode: 1,
				result: resultTypes.FAILED,
				summary: "Build failed",
			},
			{
				colour: false,
				profile: profiles.CI,
				unicode: false,
			},
		);

		expect(output).toBe(
			[
				"Command result",
				"",
				"x Failed Build failed",
				"",
				"Command    bun run build",
				"Exit code  1",
			].join("\n"),
		);
	});

	test("Uses Markdown structure for the agent profile", () => {
		const output = commandResult(
			{
				command: "bun run test:unit",
				details: ["111 tests passed"],
				result: resultTypes.SUCCESS,
				summary: "Unit tests passed",
			},
			{
				colour: false,
				profile: profiles.AGENT,
			},
		);

		expect(output).toBe(
			[
				"# Command result",
				"",
				"✓ Success Unit tests passed",
				"",
				"## Metadata",
				"- Command: bun run test:unit",
				"",
				"## Details",
				"- 111 tests passed",
			].join("\n"),
		);
	});

	test("Returns structured input unchanged for the JSON profile", () => {
		const result = {
			command: "bun run test:unit",
			result: resultTypes.SUCCESS,
		};

		expect(
			commandResult(result, {
				profile: profiles.JSON,
			}),
		).toBe(result);
	});

	test("Returns an empty string for invalid text input", () => {
		expect(commandResult(null)).toBe("");
		expect(commandResult([])).toBe("");
	});
});
