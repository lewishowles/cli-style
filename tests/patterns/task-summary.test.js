import { describe, expect, test } from "bun:test";

import {
	profiles,
	resultTypes,
	taskSummary,
} from "../../src/index.js";

describe("taskSummary", () => {
	test("Renders completed and remaining work", () => {
		const output = taskSummary({
			completed: [
				"Added renderer",
				"Added unit tests",
			],
			remaining: [
				"Review gallery output",
			],
			result: resultTypes.PARTIAL,
			summary: "Implementation complete",
			task: "Add command result pattern",
		}, {
			colour: false,
		});

		expect(output).toBe([
			"Task summary",
			"",
			"◐ Partial Add command result pattern — Implementation complete",
			"",
			"Completed",
			"- Added renderer",
			"- Added unit tests",
			"",
			"Remaining",
			"- Review gallery output",
		].join("\n"));
	});

	test("Renders a completed task with ASCII symbols", () => {
		const output = taskSummary({
			completed: ["Published package"],
			result: resultTypes.SUCCESS,
			task: "Release CLI style",
		}, {
			colour: false,
			profile: profiles.CI,
			unicode: false,
		});

		expect(output).toBe([
			"Task summary",
			"",
			"OK Success Release CLI style",
			"",
			"Completed",
			"- Published package",
		].join("\n"));
	});

	test("Renders a summary when the task name is omitted", () => {
		const output = taskSummary({
			result: resultTypes.WARNING,
			summary: "Review required",
		}, {
			colour: false,
		});

		expect(output).toContain("⚠ Warning Review required");
		expect(output).not.toContain("— Review required");
	});

	test("Uses Markdown structure for the agent profile", () => {
		const output = taskSummary({
			completed: ["Added renderer"],
			remaining: ["Review gallery output"],
			result: resultTypes.PARTIAL,
			task: "Add command result pattern",
		}, {
			colour: false,
			profile: profiles.AGENT,
		});

		expect(output).toBe([
			"# Task summary",
			"",
			"◐ Partial Add command result pattern",
			"",
			"## Completed",
			"- Added renderer",
			"",
			"## Remaining",
			"- Review gallery output",
		].join("\n"));
	});

	test("Returns structured input unchanged for the JSON profile", () => {
		const summary = {
			result: resultTypes.SUCCESS,
			task: "Add command result pattern",
		};

		expect(taskSummary(summary, {
			profile: profiles.JSON,
		})).toBe(summary);
	});

	test("Returns an empty string for invalid text input", () => {
		expect(taskSummary(null)).toBe("");
		expect(taskSummary([])).toBe("");
	});
});
