import { spawnSync } from "node:child_process";

import {
	galleryFixtures,
	gallerySections,
	galleryVariants,
} from "../gallery/render-gallery.js";

/**
 * Parse gallery command arguments.
 *
 * @param  {string[]}  args
 *     Arguments after the gallery command.
 * @returns  {object}
 *     Gallery rendering request.
 */
export function parseGalleryRequest(args = []) {
	let hasVariant = false;
	const request = {
		fixture: undefined,
		interactive: false,
		matrix: false,
		section: undefined,
		variant: "current",
	};

	for (let index = 0; index < args.length; index += 1) {
		const argument = args[index];

		if (argument === "--matrix") {
			request.matrix = true;
		} else if (argument === "--interactive") {
			request.interactive = true;
		} else if (argument === "--section") {
			request.section = readOptionValue(args, index, argument);
			index += 1;
		} else if (argument === "--fixture") {
			request.fixture = readOptionValue(args, index, argument);
			index += 1;
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
	const selection = spawnSync("fzf", [
		"--height=60%",
		"--layout=reverse",
		"--prompt=Gallery > ",
	], {
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
