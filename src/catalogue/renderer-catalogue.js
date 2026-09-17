// Static renderer metadata shared by CLI discovery and render validation.

/**
 * Options shared by every renderer adapter.
 *
 * Each adapter maps these names to the equivalent CLI flags before rendering.
 */
export const renderOptions = [
	{
		name: "profile",
		type: "string",
		required: false,
		default: null,
	},
	{
		name: "width",
		type: "number",
		required: false,
		default: null,
	},
	{
		name: "plain",
		type: "boolean",
		required: false,
		default: false,
	},
	{
		name: "noColour",
		type: "boolean",
		required: false,
		default: false,
	},
	{
		name: "noUnicode",
		type: "boolean",
		required: false,
		default: false,
	},
	{
		name: "extraArgs",
		type: "string[]",
		required: false,
		default: [],
	},
];

// Every renderer with typed inputs in CLI name order. rendererCatalogue is built
// from this list. Types are string, number, boolean, string[], number[], object,
// or object[]. A parameter is required only when the renderer cannot produce
// output without it. A renderer that normalises a missing value to an empty
// list or string has a default, so that parameter is optional.
const rendererDefinitions = [
	{
		name: "agent-transcript",
		category: "pattern",
		api: "agentTranscript",
		params: [
			{
				name: "entries",
				type: "object[]",
				required: false,
				default: [],
			},
		],
		fixture: "agent-transcript",
	},
	{
		name: "audit-finding",
		category: "pattern",
		api: "auditFinding",
		params: [
			{
				name: "finding",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "result",
				type: "string",
				required: false,
				default: "unknown",
			},
		],
		fixture: "audit-finding",
	},
	{
		name: "bar-chart",
		category: "primitive",
		api: "barChart",
		params: [
			{
				name: "rows",
				type: "object[]",
				required: false,
				default: [],
			},
		],
		fixture: undefined,
	},
	{
		name: "bullet-list",
		category: "primitive",
		api: "bulletList",
		params: [
			{
				name: "items",
				type: "object[]",
				required: false,
				default: [],
			},
		],
		fixture: undefined,
	},
	{
		name: "chip",
		category: "primitive",
		api: "chip",
		params: [
			{
				name: "label",
				type: "string",
				required: true,
				default: null,
			},
			{
				name: "tone",
				type: "string",
				required: false,
				default: "neutral",
			},
		],
		fixture: undefined,
	},
	{
		name: "command-result",
		category: "pattern",
		api: "commandResult",
		params: [
			{
				name: "result",
				type: "string",
				required: false,
				default: "unknown",
			},
			{
				name: "summary",
				type: "string",
				required: false,
				default: "",
			},
		],
		fixture: "command-result",
	},
	{
		name: "compact-data-table",
		category: "pattern",
		api: "compactDataTable",
		params: [
			{
				name: "columns",
				type: "object[]",
				required: true,
				default: null,
			},
			{
				name: "rows",
				type: "object[]",
				required: true,
				default: null,
			},
		],
		fixture: "compact-data-table",
	},
	{
		name: "confirmation-result",
		category: "pattern",
		api: "confirmationResult",
		params: [
			{
				name: "action",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "state",
				type: "string",
				required: false,
				default: "unknown",
			},
		],
		fixture: "confirmation-result",
	},
	{
		name: "diagnostic-report",
		category: "pattern",
		api: "diagnosticReport",
		params: [
			{
				name: "findings",
				type: "object[]",
				required: false,
				default: [],
			},
			// Kept for CLI compatibility; the renderer does not read it.
			{
				name: "summary",
				type: "string",
				required: false,
				default: null,
			},
		],
		fixture: "diagnostic-report",
	},
	{
		name: "diff-block",
		category: "pattern",
		api: "diffBlock",
		params: [
			{
				name: "lines",
				type: "object[]",
				required: false,
				default: null,
			},
		],
		fixture: "diff-block",
	},
	{
		name: "divider",
		category: "primitive",
		api: "divider",
		params: [
			{
				name: "label",
				type: "string",
				required: false,
				default: "",
			},
		],
		fixture: undefined,
	},
	{
		name: "empty-state",
		category: "primitive",
		api: "emptyState",
		params: [
			{
				name: "detail",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "title",
				type: "string",
				required: false,
				default: "No results",
			},
		],
		fixture: undefined,
	},
	{
		name: "error-block",
		category: "primitive",
		api: "errorBlock",
		params: [
			{
				name: "lines",
				type: "string[]",
				required: false,
				default: [],
			},
			{
				name: "title",
				type: "string",
				required: false,
				default: "Failed",
			},
		],
		fixture: undefined,
	},
	{
		name: "hint",
		category: "primitive",
		api: "hint",
		params: [
			{
				name: "message",
				type: "string",
				required: false,
				default: "",
			},
		],
		fixture: undefined,
	},
	{
		name: "labelled-line",
		category: "primitive",
		api: "labelledLine",
		params: [
			{
				name: "icon",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "label",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "message",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "wrap",
				type: "boolean",
				required: false,
				default: true,
			},
			{
				name: "wrapWidth",
				type: "number",
				required: false,
				default: null,
			},
		],
		fixture: undefined,
	},
	{
		name: "next-step-block",
		category: "pattern",
		api: "nextStepBlock",
		params: [
			{
				name: "next",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "reason",
				type: "string",
				required: false,
				default: "",
			},
		],
		fixture: "next-step-block",
	},
	{
		name: "panel",
		category: "primitive",
		api: "panel",
		params: [
			{
				name: "lines",
				type: "string[]",
				required: false,
				default: [],
			},
			{
				name: "title",
				type: "string",
				required: false,
				default: null,
			},
			{
				name: "tone",
				type: "string",
				required: false,
				default: "info",
			},
		],
		fixture: undefined,
	},
	{
		name: "progress-bar",
		category: "primitive",
		api: "progressBar",
		params: [
			{
				name: "max",
				type: "number",
				required: false,
				default: 100,
			},
			{
				name: "value",
				type: "number",
				required: false,
				default: 0,
			},
		],
		fixture: undefined,
	},
	{
		name: "row",
		category: "primitive",
		api: "row",
		params: [
			{
				name: "label",
				type: "string",
				required: true,
				default: null,
			},
			{
				name: "value",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "wrap",
				type: "boolean",
				required: false,
				default: true,
			},
			{
				name: "wrapWidth",
				type: "number",
				required: false,
				default: null,
			},
		],
		fixture: undefined,
	},
	{
		name: "row-group",
		category: "primitive",
		api: "rowGroup",
		params: [
			{
				name: "rows",
				type: "object[]",
				required: false,
				default: [],
			},
			{
				name: "wrap",
				type: "boolean",
				required: false,
				default: true,
			},
			{
				name: "wrapWidth",
				type: "number",
				required: false,
				default: null,
			},
		],
		fixture: undefined,
	},
	{
		name: "sparkline",
		category: "primitive",
		api: "sparkline",
		params: [
			{
				name: "values",
				type: "number[]",
				required: false,
				default: [],
			},
		],
		fixture: "sparkline",
	},
	{
		name: "span",
		category: "primitive",
		api: "span",
		params: [
			{
				name: "tone",
				type: "string",
				required: false,
				default: "info",
			},
			{
				name: "value",
				type: "string",
				required: false,
				default: "",
			},
		],
		fixture: undefined,
	},
	{
		name: "status",
		category: "primitive",
		api: "status",
		params: [
			{
				name: "detail",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "label",
				type: "string",
				required: false,
				default: null,
			},
			{
				name: "type",
				type: "string",
				required: false,
				default: "unknown",
			},
		],
		fixture: undefined,
	},
	{
		name: "step",
		category: "primitive",
		api: "step",
		params: [
			{
				name: "label",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "state",
				type: "string",
				required: false,
				default: "pending",
			},
		],
		fixture: undefined,
	},
	{
		name: "step-progress",
		category: "primitive",
		api: "stepProgress",
		params: [
			{
				name: "current",
				type: "number",
				required: false,
				default: 0,
			},
			{
				name: "steps",
				type: "string[]",
				required: false,
				default: [],
			},
		],
		fixture: undefined,
	},
	{
		name: "table",
		category: "primitive",
		api: "table",
		params: [
			{
				name: "columns",
				type: "object[]",
				required: false,
				default: [],
			},
			{
				name: "rows",
				type: "object[]",
				required: false,
				default: [],
			},
		],
		fixture: undefined,
	},
	{
		name: "task-summary",
		category: "pattern",
		api: "taskSummary",
		params: [
			{
				name: "result",
				type: "string",
				required: false,
				default: "unknown",
			},
			{
				name: "task",
				type: "string",
				required: false,
				default: "",
			},
		],
		fixture: "task-summary",
	},
];

// Catalogue entries keep the pre-existing fields list, derived from params, so
// CLI discovery and render validation are unchanged by the typed descriptors.
export const rendererCatalogue = rendererDefinitions.map((renderer) => ({
	api: renderer.api,
	category: renderer.category,
	fields: renderer.params.map((param) => param.name),
	fixture: renderer.fixture,
	name: renderer.name,
	params: renderer.params,
	purpose: `${renderer.api} renderer.`,
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
