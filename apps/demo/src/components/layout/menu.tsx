import { useResourceDefinitions, useCreatePath, useHasDashboard } from "ra-core";
import { NavLink } from "react-router-dom";
import { cn } from "@radish-ui/core";

/** Converts a camelCase or snake_case string into a Title Case label, e.g. "activityLog" → "Activity Log" */
function humanize(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface MenuProps {
  /** Whether the sidebar is open (controls label visibility) */
  open?: boolean;
  className?: string;
}

/**
 * Auto-generated navigation menu.
 * Reads resource definitions from ra-core and renders a link to each resource's list view.
 *
 * Copy this file into your project and customise freely.
 */
export function Menu({ open = true, className }: MenuProps) {
  const resources = useResourceDefinitions();
  const createPath = useCreatePath();
  const hasDashboard = useHasDashboard();

  return (
    <nav aria-label="Main navigation" className={cn("mt-2", className)}>
      <ul className="space-y-1 px-2">
        {hasDashboard && (
          <li key="dashboard">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-canvas-700 text-white"
                    : "text-neutral-300 hover:bg-canvas-700 hover:text-white",
                )
              }
            >
              <span aria-hidden="true" className="inline-block h-4 w-4 shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7A1 1 0 0 0 3 11h1v6a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3h2v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-6h1a1 1 0 0 0 .707-1.707l-7-7Z" />
                </svg>
              </span>
              {open ? <span>Home</span> : <span className="sr-only">Home</span>}
            </NavLink>
          </li>
        )}
        {Object.keys(resources).map((name) => {
          const resource = resources[name];
          const path = createPath({ resource: name, type: "list" });
          const to = path.startsWith("#") ? path.slice(1) : path;
          return (
            <li key={name}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-canvas-700 text-white"
                      : "text-neutral-300 hover:bg-canvas-700 hover:text-white",
                  )
                }
              >
                {/* Resource icon placeholder */}
                <span
                  aria-hidden="true"
                  className="inline-block h-4 w-4 rounded-sm bg-primary-500 shrink-0"
                />
                {open ? (
                  <span className="truncate">{resource.options?.label ?? humanize(name)}</span>
                ) : (
                  <span className="sr-only">{resource.options?.label ?? humanize(name)}</span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
