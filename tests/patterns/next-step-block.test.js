import { describe, expect, test } from "bun:test";

import { nextStepBlock, profiles } from "../../src/index.js";

describe("nextStepBlock", () => {
	test("Renders primary next action, reason, commands, and alternatives", () => {
		const output = nextStepBlock(
			{
				alternatives: ["Review the gallery first"],
				commands: ["git status --short", "bun run test:unit"],
				next: "Commit the confirmation result pattern",
				reason: "The pattern and focused gallery fixture are verified.",
			},
			{
				colour: false,
			},
		);

		expect(output).toBe(
			[
				"Next step",
				"",
				"Next  Commit the confirmation result pattern",
				"",
				"Why",
				"The pattern and focused gallery fixture are verified.",
				"",
				"Commands",
				"$ git status --short",
				"$ bun run test:unit",
				"",
				"Alternatives",
				"- Review the gallery first",
			].join("\n"),
		);
	});

	test("Keeps CI and ASCII output stable", () => {
		const output = nextStepBlock(
			{
				commands: ["bun run test:unit"],
				next: "Run verification",
			},
			{
				colour: false,
				profile: profiles.CI,
				unicode: false,
			},
		);

		expect(output).toBe(
			["Next step", "", "Next  Run verification", "", "Commands", "$ bun run test:unit"].join("\n"),
		);
	});

	test("Uses Markdown structure and fenced commands for the agent profile", () => {
		const output = nextStepBlock(
			{
				commands: ["git status --short", "bun run test:unit"],
				next: "Commit the confirmation result pattern",
				reason: "Verification passed.",
			},
			{
				colour: false,
				profile: profiles.AGENT,
			},
		);

		expect(output).toBe(
			[
				"# Next step",
				"",
				"## Next",
				"Commit the confirmation result pattern",
				"",
				"## Why",
				"Verification passed.",
				"",
				"## Commands",
				"```sh",
				"git status --short",
				"bun run test:unit",
				"```",
			].join("\n"),
		);
	});

	test("Returns structured input unchanged for the JSON profile", () => {
		const nextStep = {
			next: "Run verification",
		};

		expect(
			nextStepBlock(nextStep, {
				profile: profiles.JSON,
			}),
		).toBe(nextStep);
	});

	test("Returns an empty string for invalid text input", () => {
		expect(nextStepBlock(null)).toBe("");
		expect(nextStepBlock([])).toBe("");
	});
});
