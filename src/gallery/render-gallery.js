// Placeholder gallery text used until primitive and pattern renderers exist.
const galleryLines = [
	"CLI style gallery",
	"",
	"Status: pending",
	"Next: add theme tokens, capability detection, primitives, and patterns.",
];

/**
 * Render the initial read-only gallery placeholder.
 *
 * @returns  {string}
 *     Gallery placeholder output.
 */
export function renderGallery() {
	return galleryLines.join("\n");
}
