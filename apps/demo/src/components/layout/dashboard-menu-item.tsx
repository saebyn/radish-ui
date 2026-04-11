import { useHasDashboard } from "ra-core";
import { NavLink } from "react-router-dom";
import { cn } from "@radish-ui/core";

interface DashboardMenuItemProps {
  /** Label shown next to the icon. Defaults to "Home". */
  label?: string;
  /** Whether the sidebar is open (controls label visibility). Defaults to true. */
  open?: boolean;
  /** Route to navigate to. Defaults to "/". */
  to?: string;
  className?: string;
}

/**
 * A navigation link to the dashboard home page.
 * Renders nothing when no dashboard has been registered with ra-core.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * // Inside a custom Menu component:
 * <DashboardMenuItem open={sidebarOpen} />
 */
export function DashboardMenuItem({
  label = "Home",
  open = true,
  to = "/",
  className,
}: DashboardMenuItemProps) {
  const hasDashboard = useHasDashboard();

  if (!hasDashboard) return null;

  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-canvas-700 text-white"
            : "text-neutral-300 hover:bg-canvas-700 hover:text-white",
          className,
        )
      }
    >
      <span aria-hidden="true" className="inline-block h-4 w-4 shrink-0">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7A1 1 0 0 0 3 11h1v6a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3h2v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-6h1a1 1 0 0 0 .707-1.707l-7-7Z" />
        </svg>
      </span>
      {open ? <span>{label}</span> : <span className="sr-only">{label}</span>}
    </NavLink>
  );
}
