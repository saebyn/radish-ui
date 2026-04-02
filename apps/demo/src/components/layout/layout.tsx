import React, { useState } from "react";
import { cn } from "@radish-ui/core";
import { Sidebar } from "./sidebar";
import { Menu } from "./menu";

interface LayoutProps {
  children?: React.ReactNode;
  /** Application title shown in the header */
  title?: string | React.ReactElement;
  /** Optional dashboard element (unused here, passed through ra-core) */
  dashboard?: React.ComponentType;
}

/**
 * Main application layout shell.
 * Renders a top header, a collapsible sidebar with navigation, and a scrollable content area.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * // In your App.tsx:
 * import { Layout } from "./layout/layout";
 * <Admin layout={Layout} ...>
 */
export function Layout({ children, title }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center bg-indigo-700 px-4 shadow">
        <span className="text-lg font-semibold text-white">
          {title ?? "radish-ui"}
        </span>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
        >
          <Menu open={sidebarOpen} />
        </Sidebar>

        {/* Main content */}
        <main
          className={cn(
            "flex-1 overflow-auto p-6 transition-all duration-200"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
