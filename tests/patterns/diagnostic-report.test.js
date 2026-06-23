import { describe, expect, test } from "bun:test";

import {
	diagnosticReport,
	profiles,
	resultTypes,
} from "../../src/index.js";

describe("diagnosticReport", () => {
	test("Renders successful check summaries", () => {
		const output = diagnosticReport({
			checks: [
				{
					detail: "184 tests",
					name: "unit",
					result: resultTypes.SUCCESS,
				},
				{
					detail: "No errors",
					name: "type-check",
					result: resultTypes.SUCCESS,
				},
			],
			title: "Project diagnostics",
		}, {
			colour: false,
		});

		expect(output).toBe([
			"Project diagnostics",
			"",
			"Checks",
			"✓ Success unit — 184 tests",
			"✓ Success type-check — No errors",
		].join("\n"));
	});

	test("Renders findings, skipped checks, and next actions", () => {
		const output = diagnosticReport({
			checks: [
				{
					detail: "2 failures",
					name: "unit",
					result: resultTypes.FAILED,
				},
			],
			findings: [
				{
					message: "Coverage below target",
					result: resultTypes.WARNING,
				},
			],
			nextActions: [
				"Review failing tests",
				"Re-run unit diagnostics",
			],
			skippedChecks: [
				{
					name: "e2e",
					reason: "Browser unavailable",
				},
			],
			title: "Project diagnostics",
		}, {
			colour: false,
			unicode: false,
		});

		expect(output).toBe([
			"Project diagnostics",
			"",
			"Checks",
			"x Failed unit - 2 failures",
			"",
			"Findings",
			"! Warning Coverage below target",
			"",
			"Skipped checks",
			"- Skipped e2e - Browser unavailable",
			"",
			"Next actions",
			"1. Review failing tests",
			"2. Re-run unit diagnostics",
		].join("\n"));
	});

	test("Uses Markdown structure for the agent profile", () => {
		const output = diagnosticReport({
			checks: [
				{
					name: "unit",
					result: resultTypes.SUCCESS,
				},
			],
			title: "Project diagnostics",
		}, {
			colour: false,
			profile: profiles.AGENT,
		});

		expect(output).toBe([
			"# Project diagnostics",
			"",
			"## Checks",
			"- ✓ Success unit",
		].join("\n"));
	});

	test("Keeps CI output plain and grep-friendly", () => {
		const output = diagnosticReport({
			checks: [
				{
					detail: "No errors",
					name: "type-check",
					result: resultTypes.SUCCESS,
				},
			],
			title: "Project diagnostics",
		}, {
			colour: false,
			profile: profiles.CI,
			unicode: false,
		});

		expect(output).toBe([
			"Project diagnostics",
			"",
			"Checks",
			"OK Success type-check - No errors",
		].join("\n"));
	});

	test("Returns structured input unchanged for the JSON profile", () => {
		const report = {
			checks: [
				{
					name: "unit",
					result: resultTypes.SUCCESS,
				},
			],
			title: "Project diagnostics",
		};

		const output = diagnosticReport(report, {
			profile: profiles.JSON,
		});

		expect(output).toBe(report);
	});

	test("Returns an empty string for invalid text input", () => {
		expect(diagnosticReport(null)).toBe("");
		expect(diagnosticReport([])).toBe("");
	});
});
