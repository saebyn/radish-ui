import React from "react";
import { EditBase, useEditContext } from "ra-core";
import { cn } from "@radish-ui/core";
import { Skeleton, SkeletonContainer } from "../skeleton/skeleton";

interface EditProps {
  /**
   * The form component (e.g. <SimpleForm>).
   * Equivalent to react-admin <Edit> children prop.
   */
  children: React.ReactNode;
  /** The resource name, e.g. "posts". Deduced from URL if omitted. */
  resource?: string;
  /** The record id. Deduced from URL if omitted. */
  id?: string | number;
  /** Options passed to react-query's useQuery for the getOne request. */
  queryOptions?: object;
  /** Options passed to react-query's useMutation for the update request. */
  mutationOptions?: object;
  /**
   * Mutation mode. Default "undoable" (matches react-admin).
   * - "undoable": change is applied locally, can be cancelled for 5 s
   * - "optimistic": change is applied locally, sent in background
   * - "pessimistic": waits for server confirmation before updating UI
   */
  mutationMode?: "undoable" | "optimistic" | "pessimistic";
  /**
   * Where to redirect after a successful save.
   * Default "list". Pass false to stay on the page.
   */
  redirect?:
    | "list"
    | "show"
    | false
    | ((resource: string | undefined, id: unknown, data: unknown) => string);
  /** Transform the form data before calling dataProvider.update(). */
  transform?: (data: unknown, options?: { previousData: unknown }) => unknown | Promise<unknown>;
  /** Toolbar rendered in the header. */
  actions?: React.ReactNode;
  /** Sidebar component rendered alongside the form. */
  aside?: React.ReactNode;
  /** Return null while the record is loading. */
  emptyWhileLoading?: boolean;
  /** Page title override. Pass false to disable. */
  title?: React.ReactNode | string | false;
  className?: string;
}

/**
 * Edit page component — drop-in replacement for react-admin's <Edit>.
 *
 * Wraps <EditBase> internally so it handles its own data fetching and saving.
 * The API matches react-admin's <Edit> exactly: swap one for the other without
 * changing any other code.
 *
 * @example
 * // Identical usage to react-admin's <Edit>
 * export const PostEdit = () => (
 *   <Edit>
 *     <SimpleForm>
 *       <TextInput source="title" />
 *     </SimpleForm>
 *   </Edit>
 * );
 */
export function Edit({
  children,
  resource,
  id,
  queryOptions,
  mutationOptions,
  mutationMode = "undoable",
  redirect,
  transform,
  actions,
  aside,
  emptyWhileLoading,
  title,
  className,
}: EditProps) {
  return (
    <EditBase
      resource={resource}
      id={id}
      queryOptions={queryOptions}
      mutationOptions={mutationOptions}
      mutationMode={mutationMode}
      redirect={redirect}
      transform={transform}
    >
      <EditLayout
        actions={actions}
        aside={aside}
        emptyWhileLoading={emptyWhileLoading}
        title={title}
        className={className}
      >
        {children}
      </EditLayout>
    </EditBase>
  );
}

// ─── Internal layout component ────────────────────────────────────────────────

interface EditLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  emptyWhileLoading?: boolean;
  title?: React.ReactNode | string | false;
  className?: string;
}

function EditLayout({
  children,
  actions,
  aside,
  emptyWhileLoading,
  title,
  className,
}: EditLayoutProps) {
  const { defaultTitle, error, isLoading } = useEditContext();

  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400">
        <strong>Error loading record:</strong>{" "}
        {error instanceof Error ? error.message : String(error)}
      </div>
    );
  }

  if (emptyWhileLoading && isLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <SkeletonContainer label="Loading form…" className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          {actions && <Skeleton className="h-8 w-24" />}
        </div>
        <div className="flex gap-4">
          <div className="flex-1 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-6 shadow-sm">
            <div className="space-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
              <Skeleton className="mt-2 h-9 w-28" />
            </div>
          </div>
          {aside && <Skeleton className="h-64 w-64 shrink-0" />}
        </div>
      </SkeletonContainer>
    );
  }

  const displayTitle = title === false ? null : (title ?? defaultTitle);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        {displayTitle && <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{displayTitle}</h1>}
        {actions && <div>{actions}</div>}
      </div>

      <div className="flex gap-4">
        <div className="flex-1">{children}</div>
        {aside && <div className="w-64 shrink-0">{aside}</div>}
      </div>
    </div>
  );
}
