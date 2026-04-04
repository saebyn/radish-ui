import React, { useEffect, useState } from "react";
import { cn } from "@radish-ui/core";
import { Sidebar } from "./sidebar";
import { Menu } from "./menu";
import { Notification } from "../notification/notification";

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
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("radish-dark-mode") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    try {
      localStorage.setItem("radish-dark-mode", String(darkMode));
    } catch {
      // ignore storage errors in restricted environments
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center bg-indigo-700 dark:bg-indigo-900 px-4 shadow">
        <span className="text-lg font-semibold text-white">{title ?? "radish-ui"}</span>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="ml-auto rounded p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={darkMode}
        >
          {darkMode ? (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
              />
            </svg>
          )}
        </button>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((prev) => !prev)}>
          <Menu open={sidebarOpen} />
        </Sidebar>

        {/* Main content */}
        <main className={cn("flex-1 overflow-auto p-6 transition-all duration-200")}>
          {children}
        </main>
      </div>

      {/* Toast notifications */}
      <Notification />
    </div>
  );
}
