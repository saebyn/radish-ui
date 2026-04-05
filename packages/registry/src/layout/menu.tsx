import { useResourceDefinitions, useCreatePath } from "ra-core";
import { useLocation } from "react-router-dom";
import { cn } from "@radish-ui/core";

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
  const { pathname } = useLocation();

  return (
    <nav aria-label="Main navigation" className={cn("mt-2", className)}>
      <ul className="space-y-1 px-2">
        {Object.keys(resources).map((name) => {
          const resource = resources[name];
          const path = createPath({ resource: name, type: "list" });
          const isCurrent = pathname.startsWith(path);
          return (
            <li key={name}>
              <a
                href={path}
                aria-current={isCurrent ? "page" : undefined}
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-neutral-300 hover:bg-canvas-700 hover:text-white transition-colors"
              >
                {/* Resource icon placeholder */}
                <span aria-hidden="true" className="inline-block h-4 w-4 rounded-sm bg-primary-500 shrink-0" />
                {open ? (
                  <span className="truncate capitalize">{resource.options?.label ?? name}</span>
                ) : (
                  <span className="sr-only">{resource.options?.label ?? name}</span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
