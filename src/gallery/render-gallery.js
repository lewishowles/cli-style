import { chip } from "../primitives/chip.js";
import { divider } from "../primitives/divider.js";
import { panel } from "../primitives/panel.js";
import { row } from "../primitives/row.js";
import { status } from "../primitives/status.js";
import { resultTypes } from "../theme/results.js";

// Chip tone examples should expose every configured pill colour.
const chipToneExamples = [
	{
		label: "neutral",
		tone: "neutral",
	},
	{
		label: "info",
		tone: "info",
	},
	{
		label: "success",
		tone: "success",
	},
	{
		label: "warning",
		tone: "warning",
	},
	{
		label: "danger",
		tone: "danger",
	},
];

// Status examples should expose every configured result tone and symbol.
const statusExamples = [
	{
		detail: "tone: success",
		resultType: resultTypes.SUCCESS,
	},
	{
		detail: "tone: warning",
		resultType: resultTypes.WARNING,
	},
	{
		detail: "tone: warning",
		resultType: resultTypes.PARTIAL,
	},
	{
		detail: "tone: muted",
		resultType: resultTypes.SKIPPED,
	},
	{
		detail: "tone: muted",
		resultType: resultTypes.UNKNOWN,
	},
	{
		detail: "tone: danger",
		resultType: resultTypes.FAILED,
	},
];

// Panel examples should expose every configured semantic accent.
const panelToneExamples = [
	"info",
	"success",
	"warning",
	"danger",
];

/**
 * Render the read-only style gallery.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Gallery output.
 */
export function renderGallery(options = {}) {
	return [
		"CLI style gallery",
		"",
		renderVariant("Current terminal", options),
		"",
		renderVariant("No colour", {
			...options,
			colour: false,
		}),
		"",
		renderVariant("No Unicode", {
			...options,
			unicode: false,
		}),
		"",
		renderVariant("Plain", {
			...options,
			colour: false,
			unicode: false,
		}),
	].join("\n");
}

/**
 * Render one gallery capability variant.
 *
 * @param  {string}  title
 *     Variant title.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Variant gallery output.
 */
function renderVariant(title, options) {
	return [
		divider({
			...options,
			label: title,
		}),
		"",
		renderPrimitives(options),
	].join("\n");
}

/**
 * Render primitive examples.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Primitive gallery output.
 */
function renderPrimitives(options) {
	return [
		"Primitives",
		"",
		"Chips",
		renderChipExamples(options),
		"",
		"Statuses",
		...renderStatusExamples(options),
		"",
		"Panels",
		...renderPanelExamples(options),
		"",
		"Rows",
		row("Package", "@lewishowles/components", {
			...options,
			labelWidth: 8,
		}),
		row("Version", "minor: 2.7.4 -> 2.8.0", {
			...options,
			labelWidth: 8,
		}),
		row("Checks", "type-check, unit, build", {
			...options,
			labelWidth: 8,
		}),
	].join("\n");
}

/**
 * Render all panel tone examples.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string[]}
 *     Panel examples.
 */
function renderPanelExamples(options) {
	return panelToneExamples.map((tone) => panel({
		...options,
		lines: [`tone: ${tone}`],
		title: tone,
		tone,
	}));
}

/**
 * Render all chip tone examples.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Chip examples.
 */
function renderChipExamples(options) {
	return chipToneExamples.map((example) => chip(example.label, example.tone, options)).join(" ");
}

/**
 * Render all status examples.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string[]}
 *     Status examples.
 */
function renderStatusExamples(options) {
	return statusExamples.map((example) => status(example.resultType, example.detail, options));
}
