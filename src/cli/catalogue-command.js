import { getRendererMetadata, rendererCatalogue } from "../catalogue/renderer-catalogue.js";

// Rendering flags are resolved before catalogue command parsing.
const globalRenderingFlags = new Set([
	"--dark",
	"--json",
	"--light",
	"--no-color",
	"--no-colour",
	"--no-unicode",
	"--plain",
]);

/**
 * Parse a catalogue discovery request.
 *
 * @param  {string}  command
 *     Catalogue command name.
 * @param  {string[]}  args
 *     Arguments after the command.
 * @returns  {object}
 *     Parsed catalogue request.
 */
export function parseCatalogueRequest(command, args = []) {
	const commandArgs = args.filter((argument) => !globalRenderingFlags.has(argument));

	if (command === "list" && commandArgs.length === 0) {
		return {
			command,
		};
	}

	if (
		command === "describe" &&
		commandArgs.length === 1 &&
		getRendererMetadata(commandArgs[0]) !== undefined
	) {
		return {
			command,
			renderer: commandArgs[0],
		};
	}

	if (command === "describe" && commandArgs.length === 1) {
		throw new Error(`Unknown renderer: ${commandArgs[0]}`);
	}

	throw new Error(
		command === "describe" ? "Usage: cli-style describe <renderer>" : "Usage: cli-style list",
	);
}

/**
 * Render catalogue data for the requested output profile.
 *
 * @param  {object}  request
 *     Parsed catalogue request.
 * @param  {object}  options
 *     Resolved rendering options.
 * @returns  {string}
 *     Text or JSON catalogue output.
 */
export function renderCatalogue(request, options = {}) {
	const data =
		request.command === "list" ? rendererCatalogue : getRendererMetadata(request.renderer);

	if (options.profile === "json") {
		return JSON.stringify(data, null, 2);
	}

	if (request.command === "describe") {
		return renderDescription(data);
	}

	return ["primitive", "pattern"]
		.flatMap((category) => [
			category,
			...rendererCatalogue
				.filter((renderer) => renderer.category === category)
				.map((renderer) => `  ${renderer.name}  ${renderer.api}`),
			"",
		])
		.slice(0, -1)
		.join("\n");
}

/**
 * Render one renderer's discovery details.
 *
 * @param  {object}  renderer
 *     Renderer metadata.
 * @returns  {string}
 *     Human-readable renderer description.
 */
function renderDescription(renderer) {
	const gallery =
		renderer.fixture === undefined
			? "No focused fixture."
			: `cli-style gallery --fixture ${renderer.fixture}`;

	return [
		renderer.name,
		`Category: ${renderer.category}`,
		`JavaScript: ${renderer.api}`,
		`Fields: ${renderer.fields.join(", ")}`,
		`Gallery: ${gallery}`,
	].join("\n");
}
