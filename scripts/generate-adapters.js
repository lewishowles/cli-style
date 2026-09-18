import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { rendererCatalogue } from "../src/catalogue/renderer-catalogue.js";

// The generated module is kept beside the hand-written Python core.
const outputPath = join(
	dirname(fileURLToPath(import.meta.url)),
	"../adapters/python/cli_style/_wrappers.py",
);

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
 * Return the Python name for one catalogue parameter.
 *
 * @param  {object}  parameter
 *     Catalogue parameter metadata.
 * @returns  {string}
 *     Python parameter name.
 */
function getPythonParameterName(parameter) {
	return parameter.singular ?? parameter.languageNames?.python ?? toSnakeCase(parameter.name);
}

/**
 * Return whether a Python caller must pass the parameter, either because the
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
 * Return the Python annotation for one catalogue parameter.
 *
 * @param  {object}  parameter
 *     Catalogue parameter metadata.
 * @returns  {string}
 *     Python type annotation.
 */
function getPythonType(parameter) {
	const pythonType = pythonTypes[parameter.type];

	if (pythonType === undefined) {
		throw new Error(`Unsupported catalogue type: ${parameter.type}`);
	}

	if (parameter.singular) {
		const singularType = pythonTypes[parameter.type.replace("[]", "")];

		return singularType;
	}

	if (
		!isRequiredParameter(parameter) &&
		(parameter.default === null || Array.isArray(parameter.default))
	) {
		return `${pythonType} | None`;
	}

	return pythonType;
}

/**
 * Return the Python default for one optional parameter.
 *
 * @param  {object}  parameter
 *     Catalogue parameter metadata.
 * @returns  {string}
 *     Python default expression.
 */
function getPythonDefault(parameter) {
	if (parameter.singular) {
		return '""';
	}

	if (parameter.default === null || Array.isArray(parameter.default)) {
		return "None";
	}

	if (typeof parameter.default === "boolean") {
		return parameter.default ? "True" : "False";
	}

	return JSON.stringify(parameter.default);
}

/**
 * Return the Python parameter declaration.
 *
 * @param  {object}  parameter
 *     Catalogue parameter metadata.
 * @returns  {string}
 *     Python function parameter declaration.
 */
function renderParameter(parameter) {
	const name = getPythonParameterName(parameter);
	const declaration = `${name}: ${getPythonType(parameter)}`;

	if (isRequiredParameter(parameter)) {
		return declaration;
	}

	return `${declaration} = ${getPythonDefault(parameter)}`;
}

/**
 * Return the expression that maps a Python parameter into renderer data.
 *
 * @param  {object}  parameter
 *     Catalogue parameter metadata.
 * @returns  {string}
 *     Python expression for the renderer payload.
 */
function renderPayloadValue(parameter) {
	const name = getPythonParameterName(parameter);

	if (isRequiredParameter(parameter)) {
		return name;
	}

	if (parameter.singular) {
		return `[${name}] if ${name} else []`;
	}

	if (Array.isArray(parameter.default)) {
		return `[] if ${name} is None else ${name}`;
	}

	return name;
}

/**
 * Render one generated wrapper from catalogue metadata.
 *
 * @param  {object}  renderer
 *     Renderer catalogue entry.
 * @returns  {string}
 *     Python wrapper source.
 */
function renderWrapper(renderer) {
	const parameters = renderer.params.filter((parameter) => !parameter.adapterOmit);
	const parameterLines = parameters.map((parameter) => `\t${renderParameter(parameter)},`);

	const payloadParameters = parameters.filter(
		(parameter) => isRequiredParameter(parameter) || parameter.default !== null,
	);

	const nullableParameters = parameters.filter(
		(parameter) => !isRequiredParameter(parameter) && parameter.default === null,
	);

	const payloadLines = payloadParameters.map(
		(parameter) => `\t\t${JSON.stringify(parameter.name)}: ${renderPayloadValue(parameter)},`,
	);

	const nullablePayloadLines = nullableParameters.flatMap((parameter) => {
		const name = getPythonParameterName(parameter);

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

// Build the whole module before writing so a catalogue error leaves the old file intact.
const generatedSource = renderWrappers();

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, generatedSource);
