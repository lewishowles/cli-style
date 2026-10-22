import { expandTabs, foreground, restoreStyles, style, visibleWidth } from "../formatters/ansi.js";
import { wrapText } from "../formatters/wrap.js";

// Falls back to the informational tone when no colour token is given.
const defaultColour = "info";

// Sits between the colon-terminated prefix and the message.
const messageSeparator = " ";

/**
 * Render an icon, label, and message as one wrapped line.
 *
 * @param  {string}  label
 *     Label shown before the message; omit for an unlabelled line.
 * @param  {string}  message
 *     Message text.
 * @param  {object}  options
 *     Rendering options.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @param  {string}  options.icon
 *     Optional icon shown before the label.
 * @param  {string}  options.tone
 *     Colour token for the icon and label when colour is enabled; defaults to "info".
 * @param  {number}  options.width
 *     Total line width; the message width is this minus the label and separator.
 * @param  {boolean}  options.wrap
 *     Set to false to keep the message on one line instead of wrapping it.
 * @param  {number}  options.wrapWidth
 *     Column width at which the message wraps onto a new line.
 * @returns  {string}
 *     Rendered labelled line.
 */
export function labelledLine(label = "", message = "", options = {}) {
	const prefixText = createPrefix(label, options);
	const prefix = renderPrefix(prefixText, options);
	const messageText = expandTabs(String(message));

	if (prefix === "") {
		return messageText;
	}

	if (options.wrap === false) {
		return `${prefix}${messageSeparator}${messageText}`;
	}

	const wrapWidth = resolveWrapWidth(prefix, options);
	const messageLines = wrapText(messageText, wrapWidth);
	const continuationIndent = " ".repeat(visibleWidth(prefix) + visibleWidth(messageSeparator));
	const wrappedMessage = messageLines.join(`\n${continuationIndent}`);

	return `${prefix}${messageSeparator}${wrappedMessage}`;
}

/**
 * Colour the icon and label prefix in the line's tone when colour is on.
 *
 * @param  {string}  prefix
 *     Icon and label prefix. The icon or label may already hold colour.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Prefix, coloured when requested.
 */
function renderPrefix(prefix, options) {
	if (prefix === "") {
		return prefix;
	}

	if (options.colour !== true) {
		return prefix;
	}

	// The caller's tone, or "info" when none is given.
	const tone = resolveColour(options);

	// The prefix with bold and the line's colour switched back on after a coloured icon or
	// label, so the rest of the prefix keeps them.
	const restoredPrefix = restoreStyles(prefix, [
		style("", "bold", options),
		foreground("", tone, options),
	]);

	// The whole prefix in the line's colour, ready to be made bold.
	const colouredPrefix = foreground(restoredPrefix, tone, options);

	return style(colouredPrefix, "bold", options);
}

/**
 * Build the icon and label prefix. The icon or label may already hold colour.
 *
 * @param  {string}  label
 *     Label text.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Icon and label joined with a colon and space, or an empty string when both are empty.
 */
function createPrefix(label, options) {
	const labelText = expandTabs(String(label));
	const icon = typeof options.icon === "string" ? expandTabs(options.icon) : "";
	const labelPart = labelText === "" ? "" : `${labelText}:`;

	return [icon, labelPart].filter((part) => part !== "").join(" ");
}

/**
 * Pick the prefix's colour token.
 *
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Colour token, defaulting to "info" when no tone is given.
 */
function resolveColour(options) {
	if (typeof options.tone === "string" && options.tone !== "") {
		return options.tone;
	}

	return defaultColour;
}

/**
 * Work out how wide the message can be before it wraps.
 *
 * @param  {string}  prefix
 *     The icon and label prefix as it will be printed, including any colour.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {number|undefined}
 *     Explicit or derived wrap width, or undefined to use wrapText's own default.
 */
function resolveWrapWidth(prefix, options) {
	if (options.wrapWidth !== undefined) {
		return options.wrapWidth;
	}

	if (Number.isFinite(options.width)) {
		return Math.max(1, options.width - visibleWidth(prefix) - visibleWidth(messageSeparator));
	}

	return undefined;
}
