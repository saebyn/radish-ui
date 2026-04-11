#!/bin/bash
# sessionEnd hook: Sync demo and validate build if registry components changed.
# Automates the AGENTS.md safety checks:
#   - If packages/registry/ was modified, run pnpm sync and demo build.
#
# Receives JSON on stdin (ignored — we use git to detect changes).
# Logs progress to stderr; exits 0 always.

set -euo pipefail

REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel 2>/dev/null || echo "$PWD")"
cd "$REPO_ROOT"

echo "🔍 Checking for registry changes..." >&2

# Detect modified files under packages/registry/ (staged and unstaged tracked changes).
# We intentionally ignore untracked files to avoid triggering on temporary files.
REGISTRY_CHANGES="$(
  { git diff --name-only HEAD packages/registry/ 2>/dev/null; \
    git diff --name-only --cached packages/registry/ 2>/dev/null; } \
  | sort -u || true
)"

if [ -z "$REGISTRY_CHANGES" ]; then
  echo "✅ No registry changes detected — skipping sync." >&2
  exit 0
fi

echo "📦 Registry changes detected:" >&2
echo "$REGISTRY_CHANGES" >&2

echo "🔄 Running pnpm sync to update demo components from local registry..." >&2
pnpm sync >&2

echo "🏗️  Running pnpm --filter @radish-ui/demo build to validate demo..." >&2
pnpm --filter @radish-ui/demo build >&2

echo "✅ Session-end sync complete." >&2

exit 0
