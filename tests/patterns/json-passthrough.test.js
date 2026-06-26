import { describe, expect, test } from "bun:test";

import {
	agentTranscript,
	auditFinding,
	commandResult,
	compactDataTable,
	confirmationResult,
	diagnosticReport,
	nextStepBlock,
	profiles,
	taskSummary,
} from "../../src/index.js";

describe("Pattern JSON passthrough", () => {
	test("Returns every structured pattern input unchanged", () => {
		const cases = [
			[agentTranscript, { entries: [] }],
			[auditFinding, { finding: "Review required" }],
			[commandResult, { command: "bun test" }],
			[compactDataTable, { columns: [], rows: [] }],
			[confirmationResult, { state: "confirmed" }],
			[diagnosticReport, { checks: [] }],
			[nextStepBlock, { next: "Run tests" }],
			[taskSummary, { task: "Add patterns" }],
		];

		for (const [renderer, input] of cases) {
			expect(renderer(input, {
				profile: profiles.JSON,
			})).toBe(input);
		}
	});
});
