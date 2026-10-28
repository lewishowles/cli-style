import { help } from "../patterns/help.js";

// The package command's help screen, written as data for `ui.help`.
const helpData = {
	title: "cli-style",
	tagline: "Shared terminal output styles for local tools and package commands.",
	usage: [
		"cli-style --help",
		"cli-style adapter-path bash|python",
		"cli-style list [options]",
		"cli-style describe <renderer> [options]",
		"cli-style gallery [variant] [options]",
		"cli-style render <renderer> [options] < input.json",
	],
	sections: [
		{
			heading: "commands",
			rows: [
				{ term: "adapter-path", description: "Print a Bash or Python adapter path." },
				{ term: "gallery", description: "Print the read-only style gallery." },
				{ term: "list", description: "List available primitives and patterns." },
				{ term: "describe", description: "Describe one renderer and its input fields." },
				{ term: "render", description: "Render caller-provided JSON from stdin." },
			],
		},
		{
			heading: "gallery variants",
			rows: [
				{
					term: "current, no-colour, no-unicode, plain",
					description: "Review output under each terminal mode.",
				},
			],
		},
		{
			heading: "options",
			rows: [
				{ term: "--light, --dark", description: "Override automatic terminal-theme detection." },
				{ term: "--section <name>", description: "Show primitives or patterns." },
				{ term: "--fixture <name>", description: "Show one named pattern fixture." },
				{ term: "--profile <name>", description: "Render with a text profile." },
				{ term: "--width <columns>", description: "Render with a fixed terminal width." },
				{
					term: "--interactive",
					description: "Select a section or fixture with fzf when available.",
				},
				{ term: "--variants", description: "Show every capability variant." },
				{ term: "-h, --help", description: "Show this help." },
			],
		},
	],
};

/**
 * Render the package command's help with its current terminal style. Under the JSON
 * profile the help is plain text, because the binary has no JSON form of its help.
 *
 * @param  {object}  ui
 *     The renderer configured by the binary.
 * @returns  {string}
 *     CLI help output.
 */
export function renderHelp(ui) {
	// ui.help returns its data unchanged under the JSON profile, so render plain text directly.
	return ui.options.profile === "json"
		? help(helpData, { ...ui.options, profile: "plain" })
		: ui.help(helpData);
}
