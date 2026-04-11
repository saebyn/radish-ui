#!/bin/bash
# postToolUse hook: Run pnpm format after file edits.
# Triggered after edit, create_file, write_file, or similar file-writing tools.
#
# Receives JSON on stdin: { "toolName": "...", "toolArgs": { ... } }
# Exits 0 always — formatting is best-effort and should not block the agent.

INPUT="$(cat)"

TOOL_NAME="$(echo "$INPUT" | jq -r '.toolName')"

# Only act on file-editing tools
case "$TOOL_NAME" in
  edit | create_file | write_file | create | str_replace_based_edit_tool)
    ;;
  *)
    exit 0
    ;;
esac

# Run format from the repo root; ignore failures (best-effort)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$PWD")"
cd "$REPO_ROOT"

# Capture stdout only; stderr flows directly to the terminal so format errors remain visible
FORMAT_OUTPUT="$(pnpm format)" || {
  echo "⚠️  pnpm format encountered an error:" >&2
  echo "$FORMAT_OUTPUT" >&2
}

exit 0
