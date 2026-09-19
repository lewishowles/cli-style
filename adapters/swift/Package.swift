// swift-tools-version: 5.9

import PackageDescription

let package = Package(
	name: "CliStyle",
	products: [
		.library(
			name: "CliStyle",
			targets: ["CliStyle"]
		),
	],
	targets: [
		.target(name: "CliStyle"),
	]
)
