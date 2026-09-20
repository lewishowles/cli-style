import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { rendererCatalogue } from "../src/catalogue/renderer-catalogue.js";

const scriptsDirectoryPath = dirname(fileURLToPath(import.meta.url));
const repositoryRootPath = join(scriptsDirectoryPath, "..");

// Generated adapter modules are kept beside their hand-written language cores.
const pythonOutputPath = join(repositoryRootPath, "adapters/python/cli_style/_wrappers.py");

const swiftOutputPath = join(repositoryRootPath, "adapters/swift/Sources/CliStyle/Wrappers.swift");

// Package metadata and licence files checked alongside generated adapter modules.
const packageJsonPath = join(repositoryRootPath, "package.json");
const pythonProjectPath = join(repositoryRootPath, "adapters/python/pyproject.toml");
const repositoryLicensePath = join(repositoryRootPath, "LICENSE");
const pythonLicensePath = join(repositoryRootPath, "adapters/python/LICENSE");

// Map catalogue types to the closest useful Python annotations.
const pythonTypes = {
	boolean: "bool",
	number: "int | float",
	object: "dict[str, Any]",
	"object[]": "list[dict[str, Any]]",
	"number[]": "list[int | float]",
	string: "str",
	"string[]": "list[str]",
};

// Map catalogue types to the closest useful Swift annotations.
const swiftTypes = {
	boolean: "Bool",
	number: "Int",
	"object[]": "[[String: Any]]",
	"number[]": "[Double]",
	string: "String",
	"string[]": "[String]",
};

// Keep language-specific syntax in one descriptor so the wrapper helpers stay shared.
const languageDescriptors = {
	python: {
		booleanLiterals: {
			false: "False",
			true: "True",
		},
		defaultArrayPayload: (name) => `[] if ${name} is None else ${name}`,
		nullableType: (type) => `${type} | None`,
		nullLiteral: "None",
		parameterName: (parameter) =>
			parameter.singular ?? parameter.languageNames?.python ?? toSnakeCase(parameter.name),
		singularPayload: (name) => `[${name}] if ${name} else []`,
		types: pythonTypes,
	},
	swift: {
		booleanLiterals: {
			false: "false",
			true: "true",
		},
		defaultArrayPayload: (name) => `${name} ?? []`,
		nullableType: (type) => `${type}?`,
		nullLiteral: "nil",
		parameterName: (parameter) =>
			parameter.singular ?? parameter.languageNames?.swift ?? parameter.name,
		singularPayload: (name) => `${name}.isEmpty ? [] : [${name}]`,
		types: swiftTypes,
	},
};

/**
 * Convert a JavaScript API name to the snake-case name used by Python.
 *
 * @param  {string}  value
 *     JavaScript identifier or renderer name.
 * @returns  {string}
 *     Python identifier.
 */
function toSnakeCase(value) {
	return value
		.replaceAll(/([a-z0-9])([A-Z])/g, "$1_$2")
		.replaceAll("-", "_")
		.toLowerCase();
}

/**
 * Return whether an adapter caller must pass the parameter, either because the
 * renderer needs it or because the existing Python signature always required it.
 *
 * @param  {object}  parameter
 *     Catalogue parameter metadata.
 * @returns  {boolean}
 *     Whether the parameter is required by the adapter contract.
 */
function isRequiredParameter(parameter) {
	return parameter.adapterRequired || parameter.required;
}

/**
 * Return the annotation for one catalogue parameter in the target language.
 *
 * @param  {object}  parameter
 *     Catalogue parameter metadata.
 * @param  {object}  descriptor
 *     Target language syntax and type mappings.
 * @returns  {string}
 *     Language-specific type annotation.
 */
function getType(parameter, descriptor) {
	const type = descriptor.types[parameter.type];

	if (type === undefined) {
		throw new Error(`Unsupported catalogue type: ${parameter.type}`);
	}

	if (parameter.singular) {
		const singularType = descriptor.types[parameter.type.replace("[]", "")];

		if (singularType === undefined) {
			throw new Error(
				`Unsupported scalar type for singular parameter "${parameter.name}": ${parameter.type}`,
			);
		}

		return singularType;
	}

	if (
		!isRequiredParameter(parameter) &&
		(parameter.default === null || Array.isArray(parameter.default))
	) {
		return descriptor.nullableType(type);
	}

	return type;
}

/**
 * Return the default for one optional parameter in the target language.
 *
 * @param  {object}  parameter
 *     Catalogue parameter metadata.
 * @param  {object}  descriptor
 *     Target language syntax and type mappings.
 * @returns  {string}
 *     Language-specific default expression.
 */
function getDefault(parameter, descriptor) {
	if (parameter.singular) {
		return '""';
	}

	if (parameter.default === null || Array.isArray(parameter.default)) {
		return descriptor.nullLiteral;
	}

	if (typeof parameter.default === "boolean") {
		return descriptor.booleanLiterals[parameter.default];
	}

	return JSON.stringify(parameter.default);
}

/**
 * Return the parameter declaration in the target language.
 *
 * @param  {object}  parameter
 *     Catalogue parameter metadata.
 * @param  {object}  descriptor
 *     Target language syntax and type mappings.
 * @returns  {string}
 *     Language-specific parameter declaration.
 */
function renderParameter(parameter, descriptor) {
	const name = descriptor.parameterName(parameter);
	const declaration = `${name}: ${getType(parameter, descriptor)}`;

	if (isRequiredParameter(parameter)) {
		return declaration;
	}

	return `${declaration} = ${getDefault(parameter, descriptor)}`;
}

/**
 * Return the expression that maps a parameter into renderer data.
 *
 * @param  {object}  parameter
 *     Catalogue parameter metadata.
 * @param  {object}  descriptor
 *     Target language syntax and type mappings.
 * @returns  {string}
 *     Language-specific expression for the renderer payload.
 */
function renderPayloadValue(parameter, descriptor) {
	const name = descriptor.parameterName(parameter);

	if (isRequiredParameter(parameter)) {
		return name;
	}

	if (parameter.singular) {
		return descriptor.singularPayload(name);
	}

	if (Array.isArray(parameter.default)) {
		return descriptor.defaultArrayPayload(name);
	}

	return name;
}

/**
 * Render one generated Python wrapper from catalogue metadata.
 *
 * @param  {object}  renderer
 *     Renderer catalogue entry.
 * @returns  {string}
 *     Python wrapper source.
 */
function renderWrapper(renderer) {
	const descriptor = languageDescriptors.python;
	const parameters = renderer.params.filter((parameter) => !parameter.adapterOmit);

	const parameterLines = parameters.map(
		(parameter) => `\t${renderParameter(parameter, descriptor)},`,
	);

	const payloadParameters = parameters.filter(
		(parameter) => isRequiredParameter(parameter) || parameter.default !== null,
	);

	const nullableParameters = parameters.filter(
		(parameter) => !isRequiredParameter(parameter) && parameter.default === null,
	);

	const payloadLines = payloadParameters.map(
		(parameter) =>
			`\t\t${JSON.stringify(parameter.name)}: ${renderPayloadValue(parameter, descriptor)},`,
	);

	const nullablePayloadLines = nullableParameters.flatMap((parameter) => {
		const name = descriptor.parameterName(parameter);

		return [`\tif ${name} is not None:`, `\t\tdata[${JSON.stringify(parameter.name)}] = ${name}`];
	});

	return [
		`def ${toSnakeCase(renderer.api)}(`,
		...parameterLines,
		"\t**kwargs: Any,",
		") -> str:",
		`\t"""Return ${renderer.name} output; extra keyword arguments go to render()."""`,
		"\tdata = {",
		...payloadLines,
		"\t}",
		...(nullablePayloadLines.length > 0 ? ["", ...nullablePayloadLines] : []),
		"",
		`\treturn render(${JSON.stringify(renderer.name)}, data, **kwargs)`,
	].join("\n");
}

/**
 * Render the complete generated Python wrapper module.
 *
 * @returns  {string}
 *     Generated Python module source.
 */
function renderWrappers() {
	const wrappers = rendererCatalogue.map(renderWrapper).join("\n\n\n");

	return [
		"# Generated by scripts/generate-adapters.js. Do not edit directly.",
		"",
		"from __future__ import annotations",
		"",
		"from typing import Any",
		"",
		"from .core import render",
		"",
		wrappers,
		"",
	].join("\n");
}

/**
 * Render one generated Swift wrapper from catalogue metadata.
 *
 * @param  {object}  renderer
 *     Renderer catalogue entry.
 * @returns  {string}
 *     Swift wrapper source.
 */
function renderSwiftWrapper(renderer) {
	const descriptor = languageDescriptors.swift;
	const parameters = renderer.params.filter((parameter) => !parameter.adapterOmit);

	const parameterLines = parameters.map(
		(parameter) => `\t\t${renderParameter(parameter, descriptor)},`,
	);

	const payloadParameters = parameters.filter(
		(parameter) => isRequiredParameter(parameter) || parameter.default !== null,
	);

	const nullableParameters = parameters.filter(
		(parameter) => !isRequiredParameter(parameter) && parameter.default === null,
	);

	const payloadLines = payloadParameters.map(
		(parameter) =>
			`\t\t\t${JSON.stringify(parameter.name)}: ${renderPayloadValue(parameter, descriptor)},`,
	);

	const nullablePayloadLines = nullableParameters.flatMap((parameter) => {
		const name = descriptor.parameterName(parameter);

		return [
			`\t\tif let ${name} = ${name} {`,
			`\t\t\tdata[${JSON.stringify(parameter.name)}] = ${name}`,
			"\t\t}",
		];
	});

	const dataDeclaration = nullablePayloadLines.length > 0 ? "var" : "let";

	return [
		"\t/**",
		`\t * Return ${renderer.name} output from the cli-style binary; \`options\` sets the profile, width, and binary.`,
		"\t */",
		`\tpublic static func ${renderer.api}(`,
		...parameterLines,
		"\t\toptions: CliStyleOptions = .init()",
		"\t) throws -> String {",
		`\t\t${dataDeclaration} data: [String: Any] = [`,
		...payloadLines,
		"\t\t]",
		...(nullablePayloadLines.length > 0 ? ["", ...nullablePayloadLines] : []),
		"",
		`\t\treturn try render(${JSON.stringify(renderer.name)}, data: data, options: options)`,
		"\t}",
	].join("\n");
}

/**
 * Render the complete generated Swift wrapper module.
 *
 * @returns  {string}
 *     Generated Swift module source.
 */
function renderSwiftWrappers() {
	const wrappers = rendererCatalogue.map(renderSwiftWrapper).join("\n\n");

	return [
		"// Generated by scripts/generate-adapters.js. Do not edit directly.",
		"",
		"import Foundation",
		"",
		"extension CliStyle {",
		"",
		wrappers,
		"",
		"}",
		"",
	].join("\n");
}

// Build the whole module before writing so a catalogue error leaves the old file intact.
const generatedPythonSource = renderWrappers();
const generatedSwiftSource = renderSwiftWrappers();

// Each generated wrapper paired with the committed file it is written to, or checked against.
const generatedFiles = [
	{
		path: pythonOutputPath,
		source: generatedPythonSource,
	},
	{
		path: swiftOutputPath,
		source: generatedSwiftSource,
	},
];

/**
 * Read a licence file, treating an absent file as a reportable state rather than a crash.
 *
 * @param  {string}  path
 *     The licence file to read.
 * @returns  {Buffer|null}
 *     The file contents, or null when the file is not there.
 */
function readLicenseFile(path) {
	try {
		return readFileSync(path);
	} catch (error) {
		if (error.code === "ENOENT") {
			return null;
		}

		throw error;
	}
}

// `--check` reports committed wrappers that differ from the generated source and writes nothing.
const checkOnly = process.argv.includes("--check");

if (checkOnly) {
	// Both packages are released from one tag, so a version edited in one file and
	// forgotten in the other would publish a Python package claiming a version that
	// was never released.
	const packageManifest = JSON.parse(readFileSync(packageJsonPath, "utf8"));
	const packageVersion = packageManifest.version;

	// The version is the only field read out of pyproject.toml, and the file is ours, so
	// a pattern match avoids taking on a TOML parser for one line.
	const pythonVersionMatch = readFileSync(pythonProjectPath, "utf8").match(
		/^version\s*=\s*"([^"]+)"/m,
	);

	const pythonVersion = pythonVersionMatch?.[1];
	const versionsMatch = packageVersion === pythonVersion;

	// The Python package carries its own copy of the licence, because a wheel built from
	// the published source archive cannot reach the one at the repository root.
	const repositoryLicense = readLicenseFile(repositoryLicensePath);
	const pythonLicense = readLicenseFile(pythonLicensePath);

	const missingLicensePaths = [
		["LICENSE", repositoryLicense],
		["adapters/python/LICENSE", pythonLicense],
	]
		.filter(([, contents]) => contents === null)
		.map(([path]) => path);

	const licensesMatch = missingLicensePaths.length === 0 && repositoryLicense.equals(pythonLicense);

	// A committed wrapper is stale when its contents differ from the generated source; a missing file counts as stale.
	const staleFiles = generatedFiles.filter(({ path, source }) => {
		try {
			return readFileSync(path, "utf8") !== source;
		} catch (error) {
			if (error.code === "ENOENT") {
				return true;
			}

			throw error;
		}
	});

	if (!versionsMatch) {
		console.error("Package versions do not match:");
		console.error(`- package.json: ${packageVersion ?? "missing"}`);
		console.error(`- adapters/python/pyproject.toml: ${pythonVersion ?? "missing"}`);
	}

	if (missingLicensePaths.length > 0) {
		console.error("Licence files are missing:");

		for (const path of missingLicensePaths) {
			console.error(`- ${path}`);
		}
	} else if (!licensesMatch) {
		console.error("Licence files do not match:");
		console.error("- LICENSE");
		console.error("- adapters/python/LICENSE");
	}

	if (staleFiles.length > 0) {
		console.error("Generated adapters are stale:");

		for (const { path } of staleFiles) {
			console.error(`- ${path}`);
		}
	}

	if (staleFiles.length > 0 || !versionsMatch || !licensesMatch) {
		process.exitCode = 1;
	}
} else {
	for (const { path, source } of generatedFiles) {
		mkdirSync(dirname(path), { recursive: true });
		writeFileSync(path, source);
	}
}
