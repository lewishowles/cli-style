import { defineConfig } from "vite-plus";
import fmt from "./.oxfmtrc.json" with { type: "json" };
import lint from "./.oxlintrc.json" with { type: "json" };

export default defineConfig({
	staged: {
		"*": "vp check --fix",
	},
	fmt,
	lint,
});
