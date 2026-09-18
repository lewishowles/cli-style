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
// list or string has a default, so that parameter is optional. Parameters are
// listed in the renderer's own argument order. When a parameter's name would clash
// with a reserved word or an existing wrapper name in another language, its
// languageNames entry gives the name to use there, for example nextStepBlock
// takes next, which the Python wrapper calls next_step.
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
			{
				name: "title",
				type: "string",
				required: false,
				default: null,
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
				name: "result",
				type: "string",
				required: false,
				default: "unknown",
			},
			{
				name: "finding",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "location",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "recommendation",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "evidence",
				type: "string[]",
				required: false,
				default: [],
			},
			{
				name: "references",
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
			{
				name: "barWidth",
				type: "number",
				required: false,
				default: null,
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
			{
				name: "command",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "exitCode",
				type: "number",
				required: false,
				default: null,
			},
			{
				name: "duration",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "details",
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
			{
				name: "summary",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "title",
				type: "string",
				required: false,
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
				name: "state",
				type: "string",
				required: false,
				default: "unknown",
			},
			{
				name: "action",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "item",
				type: "string",
				required: false,
				default: "",
			},
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
				default: null,
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
				name: "title",
				type: "string",
				required: false,
				default: null,
			},
			{
				name: "checks",
				type: "object[]",
				required: false,
				default: [],
			},
			{
				name: "findings",
				type: "object[]",
				required: false,
				default: [],
			},
			{
				name: "skippedChecks",
				type: "object[]",
				required: false,
				default: [],
			},
			{
				name: "nextActions",
				type: "string[]",
				required: false,
				default: [],
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
			{
				name: "path",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "title",
				type: "string",
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
			{
				name: "dividerWidth",
				type: "number",
				required: false,
				default: null,
			},
			{
				name: "character",
				type: "string",
				required: false,
				default: "-",
			},
			{
				name: "dividerColour",
				type: "string",
				required: false,
				default: null,
			},
			{
				name: "labelColour",
				type: "string",
				required: false,
				default: null,
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
				name: "title",
				type: "string",
				required: false,
				default: "No results",
			},
			{
				name: "detail",
				type: "string",
				required: false,
				default: "",
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
				name: "title",
				type: "string",
				required: false,
				default: "Failed",
			},
			{
				name: "lines",
				type: "string[]",
				required: false,
				default: [],
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
				name: "icon",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "tone",
				type: "string",
				required: false,
				default: "info",
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
				languageNames: {
					python: "next_step",
					swift: "nextStep",
				},
			},
			{
				name: "reason",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "title",
				type: "string",
				required: false,
				default: null,
			},
			{
				name: "commands",
				type: "string[]",
				required: false,
				default: [],
			},
			{
				name: "alternatives",
				type: "string[]",
				required: false,
				default: [],
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
			{
				name: "panelWidth",
				type: "number",
				required: false,
				default: null,
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
			{
				name: "barWidth",
				type: "number",
				required: false,
				default: null,
			},
			{
				name: "tone",
				type: "string",
				required: false,
				default: "success",
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
				name: "result",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "labelWidth",
				type: "number",
				required: false,
				default: null,
			},
			{
				name: "labelColour",
				type: "string",
				required: false,
				default: null,
			},
			{
				name: "valueColour",
				type: "string",
				required: false,
				default: null,
			},
			{
				name: "separator",
				type: "string",
				required: false,
				default: null,
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
				name: "labelWidth",
				type: "number",
				required: false,
				default: null,
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
			{
				name: "width",
				type: "number",
				required: false,
				default: null,
			},
			{
				name: "label",
				type: "string",
				required: false,
				default: null,
			},
			{
				name: "tone",
				type: "string",
				required: false,
				default: "success",
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
				name: "value",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "tone",
				type: "string",
				required: false,
				default: "info",
			},
			{
				name: "weight",
				type: "string",
				required: false,
				default: null,
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
				name: "type",
				type: "string",
				required: false,
				default: "unknown",
			},
			{
				name: "label",
				type: "string",
				required: false,
				default: null,
			},
			{
				name: "detail",
				type: "string",
				required: false,
				default: "",
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
			{
				name: "width",
				type: "number",
				required: false,
				default: null,
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
			{
				name: "title",
				type: "string",
				required: false,
				default: null,
			},
			{
				name: "summary",
				type: "string",
				required: false,
				default: "",
			},
			{
				name: "completed",
				type: "string[]",
				required: false,
				default: [],
			},
			{
				name: "remaining",
				type: "string[]",
				required: false,
				default: [],
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
