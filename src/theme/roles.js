import { foreground, restoreStyles, style } from "../formatters/ansi.js";
import { colourTokens, themes } from "./colours.js";

// The kinds of text a renderer or user can name, such as a heading or a placeholder, so they never pick colours themselves.
export const textRoles = {
	ANNOTATION: "annotation",
	COMMAND: "command",
	HEADING: "heading",
	HINT: "hint",
	PLACEHOLDER: "placeholder",
	PROMPT: "prompt",
	SECONDARY: "secondary",
	TEXT: "text",
	TITLE: "title",
};

// The styles each role uses: bold, dim or italic, plus the accent colour for titles and headings.
const roleStyles = {
	[textRoles.ANNOTATION]: { attributes: ["dim"] },
	[textRoles.COMMAND]: { attributes: ["bold"] },
	[textRoles.HEADING]: { attributes: [], colour: colourTokens.accent },
	[textRoles.HINT]: { attributes: ["dim", "italic"] },
	[textRoles.PLACEHOLDER]: { attributes: ["dim"] },
	[textRoles.PROMPT]: { attributes: ["dim"] },
	[textRoles.SECONDARY]: { attributes: ["dim"] },
	[textRoles.TEXT]: { attributes: [] },
	[textRoles.TITLE]: { attributes: ["bold"], colour: colourTokens.accent },
};

/**
 * Render text according to a named role and the resolved terminal options.
 *
 * @param  {string}  role
 *     One of the public text roles.
 * @param  {string}  value
 *     Text to render.
 * @param  {object}  options
 *     Resolved colour, theme, profile, and accent options.
 * @returns  {string}
 *     Styled text, or the original text when colour is off or the profile is plain or JSON.
 * @throws  {RangeError}
 *     When the role is not one of the public text roles.
 */
export function renderTextRole(role, value, options = {}) {
	if (!Object.hasOwn(roleStyles, role)) {
		throw new RangeError(`Unknown text role: ${String(role)}`);
	}

	const roleStyle = roleStyles[role];

	if (options.colour !== true || options.profile === "json" || options.profile === "plain") {
		return value;
	}

	const styles = roleStyle.attributes.map((attribute) => style("", attribute, options));
	const accent = roleStyle.colour === undefined ? undefined : resolveAccent(options);

	if (accent !== undefined) {
		styles.push(foreground("", accent, options));
	}

	if (styles.length === 0) {
		return value;
	}

	let renderedValue = restoreStyles(value, styles);

	if (accent !== undefined) {
		renderedValue = foreground(renderedValue, accent, options);
	}

	for (const attribute of [...roleStyle.attributes].reverse()) {
		renderedValue = style(renderedValue, attribute, options);
	}

	return renderedValue;
}

/**
 * Pick the user's accent colour for the current theme, or the theme's own accent when none was set.
 *
 * @param  {object}  options
 *     Resolved theme and optional accent.
 * @returns  {string}
 *     A colour token or direct colour value.
 */
function resolveAccent(options) {
	if (options.accent === undefined) {
		return colourTokens.accent;
	}

	if (typeof options.accent === "string") {
		return options.accent;
	}

	return options.theme === themes.LIGHT ? options.accent.light : options.accent.dark;
}
