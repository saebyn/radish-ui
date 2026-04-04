import React from "react";
import { CreateBase, useCreateContext } from "ra-core";
import { cn } from "@radish-ui/core";

interface CreateProps {
  /**
   * The form component (e.g. <SimpleForm>).
   * Equivalent to react-admin <Create> children prop.
   */
  children: React.ReactNode;
  /** The resource name, e.g. "posts". Deduced from URL if omitted. */
  resource?: string;
  /** Initial record values to pre-populate the form. */
  record?: object;
  /** Options passed to react-query's useMutation for the create request. */
  mutationOptions?: object;
  /**
   * Mutation mode. Default "pessimistic" (matches react-admin).
   */
  mutationMode?: "undoable" | "optimistic" | "pessimistic";
  /**
   * Where to redirect after a successful save.
   * Default "edit". Pass false to stay on the page.
   */
  redirect?:
    | "edit"
    | "list"
    | "show"
    | false
    | ((resource: string | undefined, id: unknown, data: unknown) => string);
  /** Transform the form data before calling dataProvider.create(). */
  transform?: (data: unknown) => unknown | Promise<unknown>;
  /** Toolbar rendered in the header. */
  actions?: React.ReactNode;
  /** Sidebar component rendered alongside the form. */
  aside?: React.ReactNode;
  /** Page title override. Pass false to disable. */
  title?: React.ReactNode | string | false;
  className?: string;
}

/**
 * Create page component — drop-in replacement for react-admin's <Create>.
 *
 * Wraps <CreateBase> internally so it handles its own data saving.
 * The API matches react-admin's <Create> exactly: swap one for the other
 * without changing any other code.
 *
 * @example
 * // Identical usage to react-admin's <Create>
 * export const PostCreate = () => (
 *   <Create>
 *     <SimpleForm>
 *       <TextInput source="title" />
 *     </SimpleForm>
 *   </Create>
 * );
 */
export function Create({
  children,
  resource,
  record,
  mutationOptions,
  mutationMode = "pessimistic",
  redirect,
  transform,
  actions,
  aside,
  title,
  className,
}: CreateProps) {
  return (
    <CreateBase
      resource={resource}
      record={record}
      mutationOptions={mutationOptions}
      mutationMode={mutationMode}
      redirect={redirect}
      transform={transform}
    >
      <CreateLayout actions={actions} aside={aside} title={title} className={className}>
        {children}
      </CreateLayout>
    </CreateBase>
  );
}

// ─── Internal layout component ────────────────────────────────────────────────

interface CreateLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  title?: React.ReactNode | string | false;
  className?: string;
}

function CreateLayout({ children, actions, aside, title, className }: CreateLayoutProps) {
  const { defaultTitle } = useCreateContext();

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
