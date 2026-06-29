// Semantic colour tokens for terminal output and generated previews.
export const colourTokens = {
	accent: "#c58cff",
	background: "#070b0d",
	border: "#2a3a42",
	danger: "#ff7272",
	info: "#8bbdff",
	muted: "#6f7f87",
	success: "#8fdf72",
	surface: "#0f181b",
	surfaceRaised: "#132024",
	text: "#e8eef0",
	warning: "#f4bd5f",
};

// Terminal frame colours for gallery-style previews.
export const terminalColours = {
	background: "background",
	border: "border",
	title: "muted",
	trafficLights: {
		close: "#ff7272",
		minimise: "#f4bd5f",
		zoom: "#8fdf72",
	},
};

// Chip and pill colour pairs for speaker labels and compact states.
export const chipColours = {
	agent: {
		background: "#3a2815",
		foreground: "warning",
	},
	danger: {
		background: "#3c1d22",
		foreground: "danger",
	},
	info: {
		background: "#14273b",
		foreground: "info",
	},
	neutral: {
		background: "#172126",
		foreground: "muted",
	},
	success: {
		background: "#18351f",
		foreground: "success",
	},
	user: {
		background: "#1f3b1f",
		foreground: "success",
	},
	warning: {
		background: "#3a2815",
		foreground: "warning",
	},
};

// Panel colours for grouped reports and agent responses.
export const panelColours = {
	background: "surface",
	border: "border",
	danger: "danger",
	info: "info",
	success: "success",
	warning: "warning",
};

// Table colours for dense operational data.
export const tableColours = {
	border: "border",
	header: "muted",
	primaryText: "text",
	secondaryText: "muted",
};

// Chart colours for simple bars and positive/negative trend segments.
export const chartColours = {
	barNegative: "#c48745",
	barPositive: "success",
	barWarning: "warning",
	label: "muted",
	value: "text",
};

// Prompt colours for lightweight interactive flows.
export const promptColours = {
	active: "success",
	inactive: "text",
	marker: "success",
};

// Result tones map semantic outcomes onto colour token names.
export const toneColours = {
	danger: "danger",
	info: "info",
	muted: "muted",
	success: "success",
	warning: "warning",
};

/**
 * Resolve a colour token by name.
 *
 * @param  {string}  colourName
 *     Colour token name.
 * @returns  {string|null}
 *     Hex colour value when supported.
 */
export function getColourToken(colourName) {
	return colourTokens[colourName] ?? null;
}

/**
 * Resolve a tone to a colour token value.
 *
 * @param  {string}  tone
 *     Tone name to resolve.
 * @returns  {string|null}
 *     Hex colour value when supported.
 */
export function getToneColour(tone) {
	return getColourToken(toneColours[tone]);
}

/**
 * Resolve a direct hex colour or colour token reference.
 *
 * @param  {string}  colour
 *     Hex colour value or colour token name.
 * @returns  {string|null}
 *     Hex colour value when supported.
 */
export function resolveColourValue(colour) {
	if (colour?.startsWith("#")) {
		return colour;
	}

	return getColourToken(colour);
}
