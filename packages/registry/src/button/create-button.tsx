import React from "react";
import { useCreatePath, useResourceContext } from "ra-core";
import { Link } from "react-router-dom";
import { cn } from "@radish-ui/core";

interface CreateButtonProps {
  /** Override the resource name. Defaults to the current ResourceContext. */
  resource?: string;
  label?: string;
  className?: string;
}

/**
 * Create button for use in a List toolbar (actions prop).
 * Navigates to the create view of the current resource.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <List resource="posts" actions={<CreateButton />}>
 *   <Datagrid>...</Datagrid>
 * </List>
 */
export function CreateButton({ resource, label = "Create", className }: CreateButtonProps) {
  const resourceContext = useResourceContext();
  const createPath = useCreatePath();

  const path = createPath({ resource: resource ?? resourceContext ?? "", type: "create" });

  return (
    <Link
      to={path}
      className={cn(
        "inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors",
        className,
      )}
    >
      {label}
    </Link>
  );
}
