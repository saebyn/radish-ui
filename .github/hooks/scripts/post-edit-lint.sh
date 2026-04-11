#!/bin/bash
# postToolUse hook: Run pnpm lint after file edits.
# Triggered after edit, create_file, write_file, or similar file-writing tools.
#
# Receives JSON on stdin: { "toolName": "...", "toolArgs": { ... } }
# Captures lint output; on failure writes it to stderr so the agent can see it.
# Always exits 0 — lint issues are surfaced as warnings, not blockers.

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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$PWD")"
cd "$REPO_ROOT"

# Run lint and capture output; surface failures via stderr without blocking
LINT_OUTPUT="$(pnpm lint 2>&1)" || {
  echo "⚠️  pnpm lint found issues:" >&2
  echo "$LINT_OUTPUT" >&2
}

exit 0
