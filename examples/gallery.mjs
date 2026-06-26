#!/usr/bin/env bun

import { renderGallery } from "../src/index.js";

// Stable options for reviewing gallery output outside the current terminal.
const reviewOptions = {
	colour: false,
	profile: "plain",
	unicode: false,
	width: 64,
};

// Matrix request exercises every gallery capability variant with fixed sample data.
const reviewRequest = {
	matrix: true,
};

console.log(renderGallery(reviewOptions, reviewRequest));
