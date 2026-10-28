import { spawnSync } from "node:child_process";

import { galleryFixtures, gallerySections, galleryVariants } from "../gallery/render-gallery.js";
import { help } from "../patterns/help.js";
import { isProfile, profiles } from "../profiles/profiles.js";

// Global rendering flags accepted after `gallery` for focused review commands.
const globalRenderingFlags = new Set([
	"--dark",
	"--light",
	"--no-color",
	"--no-colour",
	"--no-unicode",
	"--plain",
]);

/**
 * Parse gallery command arguments.
 *
 * @param  {string[]}  args
 *     Arguments after the gallery command.
 * @returns  {object}
 *     Gallery rendering request, or `{ help: true }` when `--help` or `-h` is present.
 */
export function parseGalleryRequest(args = []) {
	if (args.includes("--help") || args.includes("-h")) {
		return { help: true };
	}

	let hasVariant = false;

	const request = {
		fixture: undefined,
		interactive: false,
		section: undefined,
		variant: "current",
		variants: false,
		width: undefined,
	};

	for (let index = 0; index < args.length; index += 1) {
		const argument = args[index];

		if (argument === "--variants" || argument === "--matrix") {
			request.variants = true;
		} else if (argument === "--interactive") {
			request.interactive = true;
		} else if (argument === "--section") {
			request.section = readOptionValue(args, index, argument);
			index += 1;
		} else if (argument === "--fixture") {
			request.fixture = readOptionValue(args, index, argument);
			index += 1;
		} else if (argument === "--profile") {
			validateGalleryProfile(readOptionValue(args, index, argument));
			index += 1;
		} else if (argument.startsWith("--profile=")) {
			validateGalleryProfile(readInlineOptionValue(argument, "--profile"));
		} else if (argument === "--width") {
			request.width = readWidthValue(readOptionValue(args, index, argument));
			index += 1;
		} else if (argument.startsWith("--width=")) {
			request.width = readWidthValue(readInlineOptionValue(argument, "--width"));
		} else if (argument === "--json") {
			throw new Error("Gallery does not support json output");
		} else if (globalRenderingFlags.has(argument)) {
			// Accepted here because createCliStyle() has already resolved these flags.
		} else if (argument.startsWith("-")) {
			throw new Error(`Unknown gallery option: ${argument}`);
		} else if (hasVariant) {
			throw new Error(`Unexpected gallery argument: ${argument}`);
		} else {
			request.variant = argument;
			hasVariant = true;
		}
	}

	validateRequest(request);

	return request;
}

/**
 * Render help for the gallery command with the active terminal style. Under the JSON
 * profile the help is plain text, because the binary has no JSON form of its help.
 *
 * @param  {object}  ui
 *     Renderer configured by the binary.
 * @returns  {string}
 *     Gallery command help.
 */
export function renderGalleryHelp(ui) {
	const data = {
		title: "cli-style gallery",
		tagline: "Review every style under the current terminal capabilities.",
		usage: "cli-style gallery [variant] [options]",
		sections: [
			{
				heading: "variants",
				rows: galleryVariants.map((variant) => ({
					term: variant,
					description: `Show the ${variant} output style.`,
				})),
			},
			{
				heading: "options",
				rows: [
					{ term: "--section <name>", description: "Show primitives or patterns." },
					{ term: "--fixture <name>", description: "Show one named pattern fixture." },
					{ term: "--profile <name>", description: "Render with a text profile." },
					{ term: "--width <columns>", description: "Render with a fixed terminal width." },
					{ term: "--light, --dark", description: "Override automatic terminal-theme detection." },
					{ term: "--variants", description: "Show every capability variant." },
					{
						term: "--interactive",
						description: "Select a section or fixture with fzf when available.",
					},
					{ term: "-h, --help", description: "Show this help." },
				],
			},
		],
		examples: [
			"cli-style gallery --section patterns",
			"cli-style gallery --fixture help --width 64",
		],
	};

	// ui.help returns its data unchanged under the JSON profile, so render plain text directly.
	return ui.options.profile === "json"
		? help(data, { ...ui.options, profile: "plain" })
		: ui.help(data);
}

/**
 * Select a gallery section or fixture through fzf when available.
 *
 * @param  {object}  request
 *     Parsed gallery request.
 * @returns  {object}
 *     Selected or unchanged request.
 */
export function selectInteractiveGalleryRequest(request) {
	if (request.interactive !== true || !hasFzf()) {
		return {
			...request,
			interactive: false,
		};
	}

	const choices = [
		...gallerySections.map((section) => `section:${section}`),
		...galleryFixtures.map((fixture) => `fixture:${fixture}`),
	];

	const selection = spawnSync("fzf", ["--height=60%", "--layout=reverse", "--prompt=Gallery > "], {
		encoding: "utf8",
		input: choices.join("\n"),
		stdio: ["pipe", "pipe", "inherit"],
	});

	const value = selection.status === 0 ? selection.stdout.trim() : "";

	if (value === "") {
		return {
			...request,
			interactive: false,
		};
	}

	const [type, name] = value.split(":");

	return {
		...request,
		fixture: type === "fixture" ? name : undefined,
		interactive: false,
		section: type === "section" ? name : undefined,
	};
}

/**
 * Read a required inline option value.
 *
 * @param  {string}  argument
 *     Full `--option=value` argument.
 * @param  {string}  option
 *     Option name.
 * @returns  {string}
 *     Option value.
 */
function readInlineOptionValue(argument, option) {
	const value = argument.slice(`${option}=`.length);

	if (value === "") {
		throw new Error(`Missing value for ${option}`);
	}

	return value;
}

/**
 * Read a required option value.
 *
 * @param  {string[]}  args
 *     Command arguments.
 * @param  {number}  index
 *     Option index.
 * @param  {string}  option
 *     Option name.
 * @returns  {string}
 *     Option value.
 */
function readOptionValue(args, index, option) {
	const value = args[index + 1];

	if (value === undefined || value.startsWith("-")) {
		throw new Error(`Missing value for ${option}`);
	}

	return value;
}

/**
 * Validate a gallery text profile.
 *
 * @param  {string}  profile
 *     Requested output profile.
 * @returns  {void}
 */
function validateGalleryProfile(profile) {
	if (!isProfile(profile)) {
		throw new Error(`Unknown profile: ${profile}`);
	}

	if (profile === profiles.JSON) {
		throw new Error("Gallery does not support json output");
	}
}

/**
 * Parse a gallery width option.
 *
 * @param  {string}  value
 *     Width argument value.
 * @returns  {number}
 *     Positive integer width.
 */
function readWidthValue(value) {
	const width = Number(value);

	if (!Number.isInteger(width) || width <= 0) {
		throw new Error("Gallery width must be a positive integer");
	}

	return width;
}

/**
 * Validate gallery request values.
 *
 * @param  {object}  request
 *     Parsed gallery request.
 * @returns  {void}
 */
function validateRequest(request) {
	if (!galleryVariants.includes(request.variant)) {
		throw new Error(`Unknown gallery variant: ${request.variant}`);
	}

	if (request.section !== undefined && !gallerySections.includes(request.section)) {
		throw new Error(`Unknown gallery section: ${request.section}`);
	}

	if (request.fixture !== undefined && !galleryFixtures.includes(request.fixture)) {
		throw new Error(`Unknown gallery fixture: ${request.fixture}`);
	}
}

/**
 * Check whether the optional fzf binary is available.
 *
 * @returns  {boolean}
 *     Whether fzf can be invoked.
 */
function hasFzf() {
	const result = spawnSync("fzf", ["--version"], {
		encoding: "utf8",
		stdio: "ignore",
	});

	return result.status === 0;
}
