import { background, foreground, style } from "../formatters/ansi.js";
import { profiles } from "../profiles/profiles.js";
import { panelColours } from "../theme/colours.js";

// Panels use a stable width so grouped output aligns across a report.
const defaultWidth = 40;

// Info is the neutral semantic accent for grouped explanatory content.
const defaultTone = "info";

/**
 * Render a grouped block with a semantic left accent.
 *
 * @param  {object}  options
 *     Rendering options.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @param  {string[]}  options.lines
 *     Content lines to render.
 * @param  {number}  options.panelWidth
 *     Total panel width.
 * @param  {string}  options.profile
 *     Active output profile.
 * @param  {string}  options.title
 *     Optional panel title.
 * @param  {string}  options.tone
 *     Semantic accent tone.
 * @param  {boolean}  options.unicode
 *     Whether Unicode symbols should be used.
 * @returns  {string}
 *     Rendered panel.
 */
export function panel(options = {}) {
	const lines = options.lines ?? [];

	if (options.profile === profiles.CI) {
		return [...(options.title === undefined ? [] : [options.title]), ...lines].join("\n");
	}

	const width = Math.max(options.panelWidth ?? defaultWidth, 4);
	const panelLines = ["", ...(options.title === undefined ? [] : [options.title]), ...lines, ""];

	return panelLines
		.map((line, index) =>
			renderLine(line, width, index === 1 && options.title !== undefined, options),
		)
		.join("\n");
}

/**
 * Render one fixed-width panel line.
 *
 * @param  {string}  line
 *     Content line.
 * @param  {number}  width
 *     Total panel width.
 * @param  {boolean}  isTitle
 *     Whether the line is the panel title.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Rendered content line.
 */
function renderLine(line, width, isTitle, options) {
	const accent = options.unicode === false ? "|" : "▌";
	const contentWidth = width - 5;
	const visibleLine = line.slice(0, contentWidth);
	const content = `  ${visibleLine.padEnd(contentWidth, " ")}  `;

	if (options.colour !== true) {
		return `${accent}${content}`;
	}

	const renderedAccent = renderPanelColour(accent, options);
	const renderedContent = background(content, panelColours.background, options);

	return `${renderedAccent}${isTitle ? style(renderedContent, "bold", options) : renderedContent}`;
}

/**
 * Apply the panel's semantic colour.
 *
 * @param  {string}  value
 *     Panel text to colour.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Coloured panel text.
 */
function renderPanelColour(value, options) {
	const tone = panelColours[options.tone ?? defaultTone] ?? panelColours[defaultTone];

	return foreground(value, tone, options);
}
