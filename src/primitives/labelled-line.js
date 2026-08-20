import { foreground, style } from "../formatters/ansi.js";
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
	const messageText = String(message);

	if (prefix === "") {
		return messageText;
	}

	if (options.wrap === false) {
		return `${prefix}${messageSeparator}${messageText}`;
	}

	const wrapWidth = resolveWrapWidth(prefixText, options);
	const messageLines = wrapText(messageText, wrapWidth);
	const continuationIndent = " ".repeat(prefixText.length + messageSeparator.length);
	const wrappedMessage = messageLines.join(`\n${continuationIndent}`);

	return `${prefix}${messageSeparator}${wrappedMessage}`;
}

/**
 * Colour the icon/label prefix, sized from its plain-text length so the
 * continuation indent lines up whether or not colour is applied.
 *
 * @param  {string}  prefix
 *     Plain-text icon and label prefix.
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

	const colouredPrefix = foreground(prefix, resolveColour(options), options);

	return style(colouredPrefix, "bold", options);
}

/**
 * Build the plain-text icon and label prefix.
 *
 * @param  {string}  label
 *     Label text.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Icon and label joined with a colon and space, or an empty string when both are empty.
 */
function createPrefix(label, options) {
	const labelText = String(label);
	const icon = typeof options.icon === "string" ? options.icon : "";
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
 *     Plain-text icon and label prefix, used to size the continuation indent.
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
		return Math.max(1, options.width - prefix.length - messageSeparator.length);
	}

	return undefined;
}
