import { describe, expect, test } from "bun:test";

import { agentTranscript, profiles } from "../../src/index.js";

describe("agentTranscript", () => {
	test("Renders role-labelled exchanges and tool output", () => {
		const output = agentTranscript(
			{
				entries: [
					{
						content: "Run the unit tests.",
						role: "user",
					},
					{
						content: "Running focused diagnostics.",
						role: "agent",
					},
					{
						content: ["123 tests passed", "0 tests failed"],
						name: "project-diagnostics",
						role: "tool",
					},
					{
						content: "Tests pass. Nothing remains.",
						role: "agent",
					},
				],
				title: "Agent transcript",
			},
			{
				colour: false,
			},
		);

		expect(output).toBe(
			[
				"Agent transcript",
				"",
				"[User] Run the unit tests.",
				"",
				"[Agent] Running focused diagnostics.",
				"",
				"[Tool: project-diagnostics]",
				"  123 tests passed",
				"  0 tests failed",
				"",
				"[Agent] Tests pass. Nothing remains.",
			].join("\n"),
		);
	});

	test("Renders system context and unknown roles with textual labels", () => {
		const output = agentTranscript(
			{
				entries: [
					{
						content: "Use UK spelling.",
						role: "system",
					},
					{
						content: "Review complete.",
						role: "reviewer",
					},
				],
			},
			{
				colour: false,
				profile: profiles.CI,
				unicode: false,
			},
		);

		expect(output).toBe(
			[
				"Agent transcript",
				"",
				"[System] Use UK spelling.",
				"",
				"[Participant] Review complete.",
			].join("\n"),
		);
	});

	test("Uses Markdown structure for the agent profile", () => {
		const output = agentTranscript(
			{
				entries: [
					{
						content: "Run the tests.",
						role: "user",
					},
					{
						content: ["123 tests passed", "0 tests failed"],
						name: "project-diagnostics",
						role: "tool",
					},
				],
				title: "Agent transcript",
			},
			{
				colour: false,
				profile: profiles.AGENT,
			},
		);

		expect(output).toBe(
			[
				"# Agent transcript",
				"",
				"## User",
				"Run the tests.",
				"",
				"## Tool: project-diagnostics",
				"```text",
				"123 tests passed",
				"0 tests failed",
				"```",
			].join("\n"),
		);
	});

	test("Returns structured input unchanged for the JSON profile", () => {
		const transcript = {
			entries: [
				{
					content: "Run the tests.",
					role: "user",
				},
			],
		};

		expect(
			agentTranscript(transcript, {
				profile: profiles.JSON,
			}),
		).toBe(transcript);
	});

	test("Skips invalid entries and returns an empty string for invalid input", () => {
		const output = agentTranscript(
			{
				entries: [
					null,
					{
						content: "",
						role: "user",
					},
					{
						content: "Valid message",
						role: "agent",
					},
				],
			},
			{
				colour: false,
			},
		);

		expect(output).toContain("[Agent] Valid message");
		expect(output).not.toContain("[User]");
		expect(agentTranscript(null)).toBe("");
		expect(agentTranscript([])).toBe("");
	});
});
