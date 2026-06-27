#!/usr/bin/env bash
# Builds the standalone cli-style binary and copies wrapper adapters beside it.
#
# Release layout:
#   dist/bin/cli-style
#   dist/adapters/bash/cli-style.sh
#   dist/adapters/python/cli_style.py

set -euo pipefail

mkdir -p dist/bin dist/adapters/bash dist/adapters/python

bun build --compile ./bin/cli-style.js --outfile ./dist/bin/cli-style

cp adapters/bash/cli-style.sh dist/adapters/bash/cli-style.sh
cp adapters/python/cli_style.py dist/adapters/python/cli_style.py
