import { background, foreground, restoreStyles, style, visibleWidth } from "../formatters/ansi.js";
import { defaultWidth } from "../formatters/width.js";
import { wrapText } from "../formatters/wrap.js";
import { profiles } from "../profiles/profiles.js";
import { panelColours } from "../theme/colours.js";

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
 *     Total panel width, including the accent and padding. Defaults to 80 columns.
 *     Widths below 6 are raised to 6, which leaves room for one character of content.
 *     Longer lines wrap to fit.
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
 *     The panel lines, each exactly `width` columns wide, unless a wide character
 *     does not fit in a panel at its minimum width.
 */
function renderLine(line, width, isTitle, options) {
	const accent = options.unicode === false ? "|" : "▌";
	const contentWidth = width - 5;
	// Whether this line is drawn with ANSI colour.
	const useColour = options.colour === true;

	return wrapText(line, contentWidth).map((visibleLine) => {
		// Spaces that fill the line to the content width on screen. A wide character can
		// overflow a very narrow panel, so the count never drops below zero.
		const padding = " ".repeat(Math.max(0, contentWidth - visibleWidth(visibleLine)));
		// The line with its inner margins, ready for the panel colours.
		const content = `  ${visibleLine}${padding}  `;

		if (!useColour) {
			return `${accent}${content}`;
		}

		const renderedAccent = renderPanelColour(accent, options);

		// The content with the panel colours switched back on after each reset inside it, so
		// the panel background carries on to the right edge.
		const restoredContent = restoreStyles(content, [
			background("", panelColours.background, options),
			foreground("", panelColours.body, options),
			isTitle ? style("", "bold", options) : "",
		]);

		const renderedContent = foreground(
			background(restoredContent, panelColours.background, options),
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
