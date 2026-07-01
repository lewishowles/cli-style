import { describe, expect, test } from "bun:test";

import { confirmationResult, profiles } from "../../src/index.js";

describe("confirmationResult", () => {
	test("Renders confirmed action with affected-item context", () => {
		const output = confirmationResult(
			{
				action: "Delete project",
				detail: "Project and 12 files removed.",
				item: "Website refresh",
				state: "confirmed",
			},
			{
				colour: false,
			},
		);

		expect(output).toBe(
			[
				"Confirmation result",
				"",
				"✓ Confirmed Delete project — Website refresh",
				"",
				"Detail",
				"Project and 12 files removed.",
			].join("\n"),
		);
	});

	test("Renders cancelled, declined, and failed states in ASCII mode", () => {
		const cancelled = confirmationResult(
			{
				action: "Delete project",
				item: "Website refresh",
				state: "cancelled",
			},
			{
				colour: false,
				unicode: false,
			},
		);

		const declined = confirmationResult(
			{
				action: "Publish package",
				item: "@lewishowles/cli-style",
				state: "declined",
			},
			{
				colour: false,
				unicode: false,
			},
		);

		const failed = confirmationResult(
			{
				action: "Delete project",
				item: "Website refresh",
				state: "failed",
			},
			{
				colour: false,
				unicode: false,
			},
		);

		expect(cancelled).toContain("- Cancelled Delete project - Website refresh");
		expect(declined).toContain("! Declined Publish package - @lewishowles/cli-style");
		expect(failed).toContain("x Failed Delete project - Website refresh");
	});

	test("Uses Markdown structure for the agent profile", () => {
		const output = confirmationResult(
			{
				action: "Publish package",
				detail: "Publication was cancelled before upload.",
				item: "@lewishowles/cli-style",
				state: "cancelled",
			},
			{
				colour: false,
				profile: profiles.AGENT,
			},
		);

		expect(output).toBe(
			[
				"# Confirmation result",
				"",
				"– Cancelled Publish package — @lewishowles/cli-style",
				"",
				"## Detail",
				"Publication was cancelled before upload.",
			].join("\n"),
		);
	});

	test("Returns structured input unchanged for the JSON profile", () => {
		const result = {
			action: "Delete project",
			item: "Website refresh",
			state: "confirmed",
		};

		expect(
			confirmationResult(result, {
				profile: profiles.JSON,
			}),
		).toBe(result);
	});

	test("Returns an empty string for invalid text input", () => {
		expect(confirmationResult(null)).toBe("");
		expect(confirmationResult([])).toBe("");
	});
});
