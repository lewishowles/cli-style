import { profiles } from "../profiles/profiles.js";

// Bullet symbols for Unicode, ASCII, and Markdown-compatible agent output.
export const bulletTokens = {
	agent: "-",
	ascii: "*",
	unicode: {
		nested: "◦",
		root: "•",
	},
};

/**
 * Resolve the display symbol for one bullet depth.
 *
 * @param  {number}  depth
 *     Zero-based nesting depth.
 * @param  {object}  options
 *     Symbol rendering options.
 * @param  {string}  options.profile
 *     Active output profile.
 * @param  {boolean}  options.unicode
 *     Whether to return the Unicode symbol.
 * @returns  {string}
 *     Display symbol for the requested bullet depth and profile.
 */
export function getBulletSymbol(depth = 0, options = {}) {
	if (options.profile === profiles.AGENT) {
		return bulletTokens.agent;
	}

	if (
		options.profile === profiles.CI ||
		options.profile === profiles.PLAIN ||
		options.unicode === false
	) {
		return bulletTokens.ascii;
	}

	return depth === 0 ? bulletTokens.unicode.root : bulletTokens.unicode.nested;
}
