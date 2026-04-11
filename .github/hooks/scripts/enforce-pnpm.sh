#!/bin/bash
# preToolUse hook: Block npm/npx/yarn in bash tool calls.
# This project uses pnpm exclusively (see packageManager in package.json).
#
# Receives JSON on stdin: { "toolName": "...", "toolArgs": { "command": "..." } }
# Output a deny decision to stdout if a forbidden package manager is detected.

set -euo pipefail

INPUT="$(cat)"

TOOL_NAME="$(echo "$INPUT" | jq -r '.toolName')"

# Only intercept bash tool calls
if [ "$TOOL_NAME" != "bash" ]; then
  exit 0
fi

# toolArgs is a nested JSON object; extract the command field
COMMAND="$(echo "$INPUT" | jq -r '.toolArgs.command // ""')"

# Check for npm, npx, or yarn as standalone commands (word boundary match).
# \bnpm\b and \bnpx\b will NOT match "pnpm"/"pnpx" because the word boundary
# requires a non-word character before "npm"/"npx" — in "pnpm" the preceding
# character 'p' is a word character, so no boundary exists there.
if echo "$COMMAND" | grep -qP '\bnpm\b|\bnpx\b|\byarn\b'; then
  echo '{"permissionDecision":"deny","permissionDecisionReason":"This project uses pnpm (see packageManager in package.json). Use pnpm instead of npm/npx/yarn."}'
  exit 0
fi

exit 0
