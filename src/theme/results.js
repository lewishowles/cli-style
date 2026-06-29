// Result states shared by primitive and pattern renderers.
export const resultTypes = {
	FAILED: "failed",
	INFO: "info",
	PARTIAL: "partial",
	SKIPPED: "skipped",
	SUCCESS: "success",
	UNCHANGED: "unchanged",
	UNKNOWN: "unknown",
	WARNING: "warning",
};

// Display tokens for result states before colour rendering exists.
export const resultTokens = {
	[resultTypes.FAILED]: {
		exitCode: 1,
		label: "Failed",
		symbols: {
			ascii: "x",
			unicode: "×",
		},
		tone: "danger",
	},
	[resultTypes.INFO]: {
		exitCode: null,
		label: "Info",
		symbols: {
			ascii: ">",
			unicode: "→",
		},
		tone: "info",
	},
	[resultTypes.PARTIAL]: {
		exitCode: null,
		label: "Partial",
		symbols: {
			ascii: "!",
			unicode: "◐",
		},
		tone: "warning",
	},
	[resultTypes.SKIPPED]: {
		exitCode: null,
		label: "Skipped",
		symbols: {
			ascii: "-",
			unicode: "–",
		},
		tone: "muted",
	},
	[resultTypes.SUCCESS]: {
		exitCode: 0,
		label: "Success",
		symbols: {
			ascii: "OK",
			unicode: "✓",
		},
		tone: "success",
	},
	[resultTypes.UNCHANGED]: {
		exitCode: null,
		label: "Unchanged",
		symbols: {
			ascii: "-",
			unicode: "↪",
		},
		tone: "muted",
	},
	[resultTypes.UNKNOWN]: {
		exitCode: null,
		label: "Unknown",
		symbols: {
			ascii: "?",
			unicode: "?",
		},
		tone: "muted",
	},
	[resultTypes.WARNING]: {
		exitCode: null,
		label: "Warning",
		symbols: {
			ascii: "!",
			unicode: "⚠",
		},
		tone: "warning",
	},
};

/**
 * Resolve the token for a result type.
 *
 * @param  {string}  resultType
 *     Result type to resolve.
 * @returns  {object}
 *     Matching result token, or the unknown token for unsupported values.
 */
export function getResultToken(resultType) {
	return resultTokens[resultType] ?? resultTokens[resultTypes.UNKNOWN];
}

/**
 * Resolve the display symbol for a result type.
 *
 * @param  {string}  resultType
 *     Result type to resolve.
 * @param  {object}  options
 *     Symbol rendering options.
 * @param  {boolean}  options.unicode
 *     Whether to return the Unicode symbol.
 * @returns  {string}
 *     Display symbol for the requested symbol mode.
 */
export function getResultSymbol(resultType, options = {}) {
	const token = getResultToken(resultType);
	const usesUnicode = options.unicode ?? true;

	return usesUnicode ? token.symbols.unicode : token.symbols.ascii;
}
