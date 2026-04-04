import React from "react";
import { ShowBase, useShowContext } from "ra-core";
import { cn } from "@radish-ui/core";

interface ShowProps {
  /**
   * The show layout component (e.g. <SimpleShowLayout>).
   * Equivalent to react-admin <Show> children prop.
   */
  children: React.ReactNode;
  /** The resource name, e.g. "posts". Deduced from URL if omitted. */
  resource?: string;
  /** The record id. Deduced from URL if omitted. */
  id?: string | number;
  /** Options passed to react-query's useQuery for the getOne request. */
  queryOptions?: object;
  /** Toolbar rendered in the header (e.g. an EditButton). */
  actions?: React.ReactNode;
  /** Sidebar component rendered alongside the main content. */
  aside?: React.ReactNode;
  /** Return null while the record is loading. */
  emptyWhileLoading?: boolean;
  /** Page title override. Pass false to disable. */
  title?: React.ReactNode | string | false;
  className?: string;
}

/**
 * Show page component — drop-in replacement for react-admin's <Show>.
 *
 * Wraps <ShowBase> internally so it handles its own data fetching. The API
 * matches react-admin's <Show> exactly: swap one for the other without
 * changing any other code.
 *
 * @example
 * // Identical usage to react-admin's <Show>
 * export const PostShow = () => (
 *   <Show>
 *     <SimpleShowLayout>
 *       <TextField source="title" />
 *     </SimpleShowLayout>
 *   </Show>
 * );
 */
export function Show({
  children,
  resource,
  id,
  queryOptions,
  actions,
  aside,
  emptyWhileLoading,
  title,
  className,
}: ShowProps) {
  return (
    <ShowBase resource={resource} id={id} queryOptions={queryOptions}>
      <ShowLayout
        actions={actions}
        aside={aside}
        emptyWhileLoading={emptyWhileLoading}
        title={title}
        className={className}
      >
        {children}
      </ShowLayout>
    </ShowBase>
  );
}

// ─── Internal layout component ────────────────────────────────────────────────

interface ShowLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  emptyWhileLoading?: boolean;
  title?: React.ReactNode | string | false;
  className?: string;
}

function ShowLayout({
  children,
  actions,
  aside,
  emptyWhileLoading,
  title,
  className,
}: ShowLayoutProps) {
  const { defaultTitle, error, isLoading } = useShowContext();

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        <strong>Error loading record:</strong>{" "}
        {error instanceof Error ? error.message : String(error)}
      </div>
    );
  }

  if (emptyWhileLoading && isLoading) {
    return null;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-gray-500">Loading…</div>;
  }

  const displayTitle = title === false ? null : (title ?? defaultTitle);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        {displayTitle && <h1 className="text-2xl font-bold text-gray-800">{displayTitle}</h1>}
        {actions && <div>{actions}</div>}
      </div>

      <div className="flex gap-4">
        <div className="flex-1">{children}</div>
        {aside && <div className="w-64 shrink-0">{aside}</div>}
      </div>
    </div>
  );
}
