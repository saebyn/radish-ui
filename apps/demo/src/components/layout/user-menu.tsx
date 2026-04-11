import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGetIdentity, useLogout, useTranslate } from "ra-core";
import { cn } from "@radish-ui/core";

/** Returns up to two initials from a display name. */
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// ---------------------------------------------------------------------------
// UserMenuItem
// ---------------------------------------------------------------------------

interface UserMenuItemProps {
  /** Click handler */
  onClick?: () => void;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * A single action item inside a `<UserMenu>` dropdown.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <UserMenu>
 *   <UserMenuItem onClick={() => navigate('/profile')}>Profile</UserMenuItem>
 * </UserMenu>
 */
export function UserMenuItem({ onClick, icon, children, className }: UserMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-4 py-2 text-sm text-neutral-700",
        "hover:bg-canvas-100 focus:bg-canvas-100 focus:outline-none",
        "dark:text-neutral-200 dark:hover:bg-canvas-700 dark:focus:bg-canvas-700",
        className,
      )}
    >
      {icon && (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// UserMenu
// ---------------------------------------------------------------------------

interface UserMenuProps {
  /**
   * Custom menu items rendered above the built-in logout button.
   * Use `<UserMenuItem>` for individual entries.
   */
  children?: React.ReactNode;
  /** Label for the logout button. Defaults to the ra.auth.logout translation key. */
  logoutLabel?: string;
  /** Extra className applied to the root wrapper element. */
  className?: string;
}

/**
 * Dropdown user menu for the app header.
 * Shows the current user's avatar and name (via `useGetIdentity`),
 * optional custom action items, and a built-in logout button (via `useLogout`).
 *
 * Renders nothing when there is no authenticated identity.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * // Minimal – just logout
 * <UserMenu />
 *
 * @example
 * // With extra actions
 * <UserMenu>
 *   <UserMenuItem onClick={() => navigate('/profile')}>My Profile</UserMenuItem>
 * </UserMenu>
 */
export function UserMenu({ children, logoutLabel, className }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const translate = useTranslate();
  const logout = useLogout();
  const { identity, isPending } = useGetIdentity();

  const resolvedLogoutLabel = logoutLabel ?? translate("ra.auth.logout", { _: "Logout" });

  // Close when clicking outside the menu wrapper
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleLogout = useCallback(() => {
    setOpen(false);
    logout();
  }, [logout]);

  if (isPending) return null;

  const displayName = identity?.fullName ?? "";
  const initials = displayName ? getInitials(displayName) : "U";
  const ariaLabel = displayName ? `User menu for ${displayName}` : "User menu";

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={cn(
          "flex items-center gap-2 rounded-full px-1.5 py-1 transition-colors",
          "text-white/80 hover:text-white hover:bg-white/10",
          "focus:outline-none focus:ring-2 focus:ring-white/40",
        )}
      >
        {/* Avatar circle */}
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white shrink-0"
        >
          {initials}
        </span>

        {displayName && (
          <span className="hidden sm:block max-w-[10rem] truncate text-sm font-medium">
            {displayName}
          </span>
        )}

        {/* Chevron */}
        <svg
          className="h-4 w-4 shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="menu"
          aria-label={displayName ? `${displayName} actions` : "User actions"}
          className={cn(
            "absolute right-0 z-50 mt-2 w-52 rounded-md border border-neutral-200 bg-canvas-0 shadow-lg",
            "dark:border-neutral-700 dark:bg-canvas-800",
          )}
        >
          {/* Identity header */}
          {displayName && (
            <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
              <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {displayName}
              </p>
            </div>
          )}

          {/* Custom items */}
          {children && <div className="py-1">{children}</div>}

          {/* Logout */}
          <div
            className={cn(
              "py-1",
              children || displayName
                ? "border-t border-neutral-200 dark:border-neutral-700"
                : undefined,
            )}
          >
            <UserMenuItem
              onClick={handleLogout}
              icon={
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M6 10a.75.75 0 0 1 .75-.75h9.546l-1.048-.943a.75.75 0 1 1 1.004-1.114l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 1 1-1.004-1.114l1.048-.943H6.75A.75.75 0 0 1 6 10Z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            >
              {resolvedLogoutLabel}
            </UserMenuItem>
          </div>
        </div>
      )}
    </div>
  );
}
