# AGENTS.md

Repository-wide instructions for coding agents (Copilot or otherwise).

## Core Workflow

- Treat `packages/registry/src/*` as the source of truth for shared UI components.
- If a component exists in the registry, make changes in the registry first.
- Do not hand-edit the demo copy of registry-managed components in `apps/demo/src/components/*` unless the change is explicitly demo-only.

## Sync Rules

- After changing registry components, sync into the demo using the local registry config.
- Use the local CLI workflow (not hosted registry) when updating demo component copies.

### Preferred commands

```bash
pnpm --filter @radish-ui/demo sync
```

or

```bash
pnpm sync
```

## Demo-Only Exceptions

Direct edits in `apps/demo/src/components/*` are allowed only when:

- The behavior is intentionally demo-specific, and
- The same behavior is not desired for registry consumers.

When doing a demo-only override, clearly state that intent in your summary/PR notes.

## Safety Checks Before Finishing

- If a registry-managed component was changed, ensure demo copy is synced from local registry.
- Avoid leaving accidental drift between:
  - `packages/registry/src/...`
  - `apps/demo/src/components/...`
- Run a focused validation build after changes:

```bash
pnpm --filter @radish-ui/demo build
```
