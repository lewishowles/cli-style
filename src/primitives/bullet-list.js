import { wrapText } from "../formatters/wrap.js";
import { getBulletSymbol } from "../theme/bullets.js";

/**
 * Render items as a bullet list, wrapping each item's text beside its bullet.
 *
 * @param  {object[]}  items
 *     Item text, or `{ text, items }` for an item with nested items. Empty and
 *     malformed items are skipped.
 * @param  {object}  options
 *     Rendering and wrapping options.
 * @param  {number}  options.width
 *     Total line width used to calculate the available item width.
 * @param  {number}  options.wrapWidth
 *     Explicit text width for each item.
 * @returns  {string}
 *     Rendered bullet list, or an empty string when no usable items exist.
 */
export function bulletList(items = [], options = {}) {
	const normalisedItems = normaliseItems(items);

	if (normalisedItems.length === 0) {
		return "";
	}

	return renderItems(normalisedItems, options, 0).join("\n");
}

/**
 * Render one level of items and its nested children.
 *
 * @param  {object[]}  items
 *     Normalised entries at the current nesting level.
 * @param  {object}  options
 *     Rendering and wrapping options.
 * @param  {number}  depth
 *     Zero-based nesting depth.
 * @returns  {string[]}
 *     Rendered lines for this level and its children.
 */
function renderItems(items, options, depth) {
	const lines = [];

	for (const entry of items) {
		const prefix = createPrefix(depth, options);
		const itemLines = wrapText(entry.text, resolveWrapWidth(prefix, options));

		lines.push(
			...itemLines.map((line, index) => {
				if (index === 0) {
					return `${prefix}${line}`;
				}

				return `${" ".repeat(prefix.length)}${line}`;
			}),
		);

		const childItems = normaliseItems(entry.items);

		if (childItems.length > 0) {
			lines.push(...renderItems(childItems, options, depth + 1));
		}
	}

	return lines;
}

/**
 * Build the plain-text prefix used for one item and its continuations.
 *
 * @param  {number}  depth
 *     Zero-based nesting depth.
 * @param  {object}  options
 *     Symbol rendering options.
 * @returns  {string}
 *     Uncoloured indentation, bullet, and trailing space.
 */
function createPrefix(depth, options) {
	const symbol = getBulletSymbol(depth, options);
	const gutter = `${symbol} `;
	const indentation = " ".repeat(depth * gutter.length);

	return `${indentation}${gutter}`;
}

/**
 * Resolve the text width available after the item prefix.
 *
 * @param  {string}  prefix
 *     Plain-text item prefix.
 * @param  {object}  options
 *     Rendering and wrapping options.
 * @returns  {number|undefined}
 *     Explicit text width, derived text width, or undefined for wrapText's default.
 */
function resolveWrapWidth(prefix, options) {
	if (options.wrapWidth !== undefined) {
		return options.wrapWidth;
	}

	if (Number.isFinite(options.width)) {
		return Math.max(1, options.width - prefix.length);
	}

	return undefined;
}

/**
 * Convert a list value into renderable entries, dropping unusable items.
 *
 * @param  {*}  items
 *     Requested list entries.
 * @returns  {object[]}
 *     Non-empty strings and valid nested entries.
 */
function normaliseItems(items) {
	if (!Array.isArray(items)) {
		return [];
	}

	return items.map(normaliseItem).filter((entry) => entry !== null);
}

/**
 * Convert one supported input value into a list entry.
 *
 * @param  {*}  item
 *     Requested list value.
 * @returns  {object|null}
 *     Original object or a new entry for a string, or null when the value has no usable text.
 */
function normaliseItem(item) {
	if (typeof item === "string" && item.trim() !== "") {
		return {
			items: [],
			text: item,
		};
	}

	if (
		item !== null &&
		typeof item === "object" &&
		typeof item.text === "string" &&
		item.text.trim() !== ""
	) {
		return item;
	}

	return null;
}
