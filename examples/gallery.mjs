#!/usr/bin/env bun

import { renderGallery } from "../src/index.js";

// Stable options for reviewing gallery output outside the current terminal.
const reviewOptions = {
	colour: false,
	profile: "plain",
	unicode: false,
	width: 64,
};

// Variants request exercises every gallery capability variant with fixed sample data.
const reviewRequest = {
	variants: true,
};

console.log(renderGallery(reviewOptions, reviewRequest));
