#!/usr/bin/env bun

import { Buffer } from "node:buffer";

import { createCliStyle, renderGallery, renderHelp } from "../src/index.js";
import {
	parseGalleryRequest,
	selectInteractiveGalleryRequest,
} from "../src/cli/gallery-command.js";
import {
	parseRenderRequest,
	renderJsonInput,
} from "../src/cli/render-command.js";

// Command-line arguments passed to the package binary.
const args = process.argv.slice(2);

// First positional command requested by the caller.
const command = args[0];

// Renderer configured from the current terminal.
const ui = createCliStyle({
	argv: args,
	env: process.env,
	stdout: process.stdout,
});

/**
 * Print text with a trailing newline.
 *
 * @param  {string}  value
 *     Text to print.
 * @returns  {void}
 */
function print(value) {
	console.log(value);
}

if (command === undefined || command === "--help" || command === "-h") {
	print(renderHelp());
} else if (command === "gallery") {
	try {
		const request = parseGalleryRequest(args.slice(1));
		const selectedRequest = selectInteractiveGalleryRequest(request);

		print(renderGallery(ui.options, selectedRequest));
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
} else if (command === "render") {
	try {
		const request = parseRenderRequest(args.slice(1));
		const input = await readStdin();

		print(renderJsonInput(input, request, ui.options));
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
} else {
	console.error(`Unknown command: ${command}`);
	console.error("");
	console.error(renderHelp());
	process.exitCode = 1;
}

/**
 * Read all stdin data for custom render input.
 *
 * @returns  {Promise<string>}
 *     Stdin text.
 */
async function readStdin() {
	const chunks = [];

	for await (const chunk of process.stdin) {
		chunks.push(Buffer.from(chunk));
	}

	return Buffer.concat(chunks).toString("utf8");
}
