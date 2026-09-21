import { background, foreground, style } from "../formatters/ansi.js";
import { wrapText } from "../formatters/wrap.js";
import { profiles } from "../profiles/profiles.js";
import { panelColours } from "../theme/colours.js";

// The width used when no width is given, such as a direct library call outside a terminal.
const defaultWidth = 40;

// The narrowest panel that still leaves one column for content beside the accent and padding.
const minimumWidth = 6;

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
 * @param  {number}  options.width
 *     Total panel width, including the accent and padding. Widths below 6 are raised to 6,
 *     which leaves room for one character of content. Longer lines wrap to fit.
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

	const width = Math.max(options.width ?? defaultWidth, minimumWidth);
	const panelLines = ["", ...(options.title === undefined ? [] : [options.title]), ...lines, ""];

	return panelLines
		.flatMap((line, index) =>
			renderLine(line, width, index === 1 && options.title !== undefined, options),
		)
		.join("\n");
}

/**
 * Render one content line, wrapped across as many panel lines as it needs.
 *
 * @param  {string}  line
 *     Content line.
 * @param  {number}  width
 *     Total panel width.
 * @param  {boolean}  isTitle
 *     Whether the line is the panel title.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string[]}
 *     The panel lines, each exactly `width` columns wide.
 */
function renderLine(line, width, isTitle, options) {
	const accent = options.unicode === false ? "|" : "▌";
	const contentWidth = width - 5;

	return wrapText(line, contentWidth).map((visibleLine) => {
		const content = `  ${visibleLine.padEnd(contentWidth, " ")}  `;

		if (options.colour !== true) {
			return `${accent}${content}`;
		}

		const renderedAccent = renderPanelColour(accent, options);

		const renderedContent = foreground(
			background(content, panelColours.background, options),
			panelColours.body,
			options,
		);

		return `${renderedAccent}${isTitle ? style(renderedContent, "bold", options) : renderedContent}`;
	});
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
