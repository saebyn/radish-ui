import React from "react";
import { MdMenu } from "react-icons/md";
import { cn } from "@radish-ui/core";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

/**
 * Collapsible sidebar shell.
 * Renders a slide-in panel with a toggle button using react-icons/md MdMenu.
 *
 * Copy this file into your project and customise freely.
 */
export function Sidebar({ open, onToggle, children }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col bg-neutral-900 dark:bg-neutral-950 text-white transition-all duration-200",
        open ? "w-56" : "w-14",
      )}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-12 w-full text-neutral-400 hover:text-white hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      >
        <MdMenu size={22} />
      </button>

      {/* Nav content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </aside>
  );
}
