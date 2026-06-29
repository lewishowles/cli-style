// Default terminal width used when no usable width is provided.
export const defaultWidth = 80;

// Narrowest width that still leaves room for meaningful terminal output.
export const minimumWidth = 20;

/**
 * Resolve a usable terminal width.
 *
 * @param  {*}  width
 *     Caller-provided width.
 * @param  {object}  options
 *     Width bounds.
 * @param  {number}  options.defaultWidth
 *     Width to use when the input is unusable.
 * @param  {number}  options.maxWidth
 *     Optional maximum width.
 * @param  {number}  options.minWidth
 *     Minimum accepted width.
 * @returns  {number}
 *     Integer width within the requested bounds.
 */
export function normaliseWidth(width, options = {}) {
	const fallback = normaliseBound(options.defaultWidth, defaultWidth);
	const lowerBound = normaliseBound(options.minWidth, minimumWidth);
	const upperBound = normaliseOptionalBound(options.maxWidth);
	const numericWidth = Number(width);

	if (width === null || width === undefined || !Number.isFinite(numericWidth)) {
		return clampWidth(fallback, lowerBound, upperBound);
	}

	return clampWidth(Math.floor(numericWidth), lowerBound, upperBound);
}

/**
 * Resolve a positive numeric bound.
 *
 * @param  {*}  value
 *     Caller-provided bound.
 * @param  {number}  fallback
 *     Bound to use when value is unusable.
 * @returns  {number}
 *     Positive integer bound.
 */
function normaliseBound(value, fallback) {
	const numericValue = Number(value);

	if (!Number.isFinite(numericValue) || numericValue < 1) {
		return fallback;
	}

	return Math.floor(numericValue);
}

/**
 * Resolve an optional maximum width.
 *
 * @param  {*}  value
 *     Caller-provided maximum width.
 * @returns  {number|null}
 *     Positive integer maximum or null.
 */
function normaliseOptionalBound(value) {
	const numericValue = Number(value);

	if (!Number.isFinite(numericValue) || numericValue < 1) {
		return null;
	}

	return Math.floor(numericValue);
}

/**
 * Clamp a width between configured bounds.
 *
 * @param  {number}  width
 *     Width to clamp.
 * @param  {number}  minWidth
 *     Lower bound.
 * @param  {number|null}  maxWidth
 *     Optional upper bound.
 * @returns  {number}
 *     Clamped width.
 */
function clampWidth(width, minWidth, maxWidth) {
	const lowerClampedWidth = Math.max(width, minWidth);

	return maxWidth === null
		? lowerClampedWidth
		: Math.min(lowerClampedWidth, Math.max(maxWidth, minWidth));
}
