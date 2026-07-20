// Static renderer metadata shared by CLI discovery and render validation.
export const rendererCatalogue = [
	["agent-transcript", "pattern", "agentTranscript", ["entries"], "agent-transcript"],
	["audit-finding", "pattern", "auditFinding", ["finding", "result"], "audit-finding"],
	["bar-chart", "primitive", "barChart", ["rows"], undefined],
	["chip", "primitive", "chip", ["label", "tone"], undefined],
	["command-result", "pattern", "commandResult", ["result", "summary"], "command-result"],
	["compact-data-table", "pattern", "compactDataTable", ["columns", "rows"], "compact-data-table"],
	[
		"confirmation-result",
		"pattern",
		"confirmationResult",
		["action", "state"],
		"confirmation-result",
	],
	[
		"diagnostic-report",
		"pattern",
		"diagnosticReport",
		["findings", "summary"],
		"diagnostic-report",
	],
	["diff-block", "pattern", "diffBlock", ["lines"], "diff-block"],
	["divider", "primitive", "divider", ["label"], undefined],
	["empty-state", "primitive", "emptyState", ["detail", "title"], undefined],
	["error-block", "primitive", "errorBlock", ["lines", "title"], undefined],
	["hint", "primitive", "hint", ["message"], undefined],
	["next-step-block", "pattern", "nextStepBlock", ["next", "reason"], "next-step-block"],
	["panel", "primitive", "panel", ["lines", "title", "tone"], undefined],
	["progress-bar", "primitive", "progressBar", ["max", "value"], undefined],
	["row", "primitive", "row", ["label", "value"], undefined],
	["row-group", "primitive", "rowGroup", ["rows"], undefined],
	["sparkline", "primitive", "sparkline", ["values"], "sparkline"],
	["span", "primitive", "span", ["tone", "value"], undefined],
	["status", "primitive", "status", ["detail", "type"], undefined],
	["step", "primitive", "step", ["label", "state"], undefined],
	["step-progress", "primitive", "stepProgress", ["current", "steps"], undefined],
	["table", "primitive", "table", ["columns", "rows"], undefined],
	["task-summary", "pattern", "taskSummary", ["result", "task"], "task-summary"],
].map(([name, category, api, fields, fixture]) => ({
	api,
	category,
	fields,
	fixture,
	name,
	purpose: `${api} renderer.`,
}));

// Stable CLI names derived from the catalogue.
export const rendererNames = rendererCatalogue.map((renderer) => renderer.name);

/**
 * Find renderer metadata by its stable CLI name.
 *
 * @param  {string}  name
 *     Renderer name to look up.
 * @returns  {object|undefined}
 *     Renderer metadata when found.
 */
export function getRendererMetadata(name) {
	return rendererCatalogue.find((renderer) => renderer.name === name);
}
