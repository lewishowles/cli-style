// Semantic colour roles used by renderers and public integrations.
export const colourTokens = {
	accent: "accent",
	background: "background",
	border: "border",
	danger: "danger",
	info: "info",
	muted: "muted",
	success: "success",
	surface: "surface",
	surfaceRaised: "surfaceRaised",
	text: "text",
	warning: "warning",
};

// Resolved theme names accepted by the public rendering options.
export const themes = {
	AUTO: "auto",
	DARK: "dark",
	LIGHT: "light",
};

const defaultBackground = "default-background";
const defaultForeground = "default-foreground";

// Theme palettes keep normal text on the user's terminal foreground.
const palettes = {
	[themes.AUTO]: {
		accent: defaultForeground,
		background: defaultBackground,
		border: defaultForeground,
		danger: defaultForeground,
		info: defaultForeground,
		muted: defaultForeground,
		success: defaultForeground,
		surface: defaultBackground,
		surfaceRaised: defaultBackground,
		text: defaultForeground,
		warning: defaultForeground,
		chipAgent: defaultBackground,
		chipDanger: defaultBackground,
		chipInfo: defaultBackground,
		chipNeutral: defaultBackground,
		chipSuccess: defaultBackground,
		chipWarning: defaultBackground,
	},
	[themes.DARK]: {
		accent: "ansi-256:183",
		background: defaultBackground,
		border: "ansi-256:239",
		danger: "ansi-256:210",
		info: "ansi-256:117",
		muted: "ansi-256:246",
		success: "ansi-256:114",
		surface: "ansi-256:234",
		surfaceRaised: "ansi-256:236",
		text: defaultForeground,
		warning: "ansi-256:215",
		chipAgent: "ansi-256:58",
		chipDanger: "ansi-256:52",
		chipInfo: "ansi-256:17",
		chipNeutral: "ansi-256:236",
		chipSuccess: "ansi-256:22",
		chipWarning: "ansi-256:58",
	},
	[themes.LIGHT]: {
		accent: "ansi-256:25",
		background: defaultBackground,
		border: "ansi-256:250",
		danger: "ansi-256:160",
		info: "ansi-256:25",
		muted: "ansi-256:242",
		success: "ansi-256:28",
		surface: "ansi-256:255",
		surfaceRaised: "ansi-256:254",
		text: defaultForeground,
		warning: "ansi-256:94",
		chipAgent: "ansi-256:229",
		chipDanger: "ansi-256:224",
		chipInfo: "ansi-256:153",
		chipNeutral: "ansi-256:254",
		chipSuccess: "ansi-256:194",
		chipWarning: "ansi-256:229",
	},
};

// Terminal frame colours for gallery-style previews.
export const terminalColours = {
	background: "background",
	border: "border",
	title: "muted",
	trafficLights: {
		close: "danger",
		minimise: "warning",
		zoom: "success",
	},
};

// Chip and pill colour pairs for speaker labels and compact states.
export const chipColours = {
	agent: {
		background: "chipAgent",
		foreground: "warning",
	},
	danger: {
		background: "chipDanger",
		foreground: "danger",
	},
	info: {
		background: "chipInfo",
		foreground: "info",
	},
	neutral: {
		background: "chipNeutral",
		foreground: "muted",
	},
	success: {
		background: "chipSuccess",
		foreground: "success",
	},
	user: {
		background: "chipSuccess",
		foreground: "success",
	},
	warning: {
		background: "chipWarning",
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
	barNegative: "warning",
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
 * Resolve a colour token by name for the active theme.
 *
 * @param  {string}  colourName
 *     Colour token name.
 * @param  {object}  options
 *     Rendering options.
 * @param  {string}  options.theme
 *     Resolved terminal theme.
 * @returns  {string|null}
 *     ANSI-256, terminal-default, or null when unsupported.
 */
export function getColourToken(colourName, options = {}) {
	return palettes[resolveTheme(options.theme)][colourName] ?? null;
}

/**
 * Resolve a tone to a colour token value.
 *
 * @param  {string}  tone
 *     Semantic tone name.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string|null}
 *     ANSI-256, terminal-default, or null when unsupported.
 */
export function getToneColour(tone, options = {}) {
	return getColourToken(toneColours[tone], options);
}

/**
 * Resolve a colour token or direct hex value.
 *
 * @param  {string}  colour
 *     Colour token name or hex colour.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string|null}
 *     Resolved formatter colour value when supported.
 */
export function resolveColourValue(colour, options = {}) {
	if (colour?.startsWith("#")) {
		return colour;
	}

	return getColourToken(colour, options);
}

/**
 * Check whether a value is a recognised theme name.
 *
 * @param  {string}  theme
 *     Candidate theme name.
 * @returns  {boolean}
 *     Whether the theme can select a palette.
 */
export function isTheme(theme) {
	return Object.values(themes).includes(theme);
}

/**
 * Resolve an unknown theme to the safe automatic palette.
 *
 * @param  {string}  theme
 *     Candidate theme name.
 * @returns  {string}
 *     Recognised theme name.
 */
function resolveTheme(theme) {
	return isTheme(theme) ? theme : themes.DARK;
}
