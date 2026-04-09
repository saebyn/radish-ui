import { useRecordContext, useCreatePath, useResourceContext, useTranslate } from "ra-core";
import { Link } from "react-router-dom";
import { cn } from "@radish-ui/core";

interface EditButtonProps {
  /** Override the resource name. Defaults to the current ResourceContext. */
  resource?: string;
  label?: string;
  className?: string;
}

/**
 * Edit button for use inside a Datagrid row.
 * Navigates to the edit view of the current record.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <Datagrid>
 *   <TextField source="title" />
 *   <EditButton />
 * </Datagrid>
 */
export function EditButton({ resource, label, className }: EditButtonProps) {
  const translate = useTranslate();
  const record = useRecordContext();
  const resourceContext = useResourceContext();
  const createPath = useCreatePath();
  const resolvedLabel = label ?? translate("ra.action.edit", { _: "Edit" });

  const resolvedResource = resource ?? resourceContext;
  if (!record || !resolvedResource) return null;

  const rawPath = createPath({
    resource: resolvedResource,
    type: "edit",
    id: record.id,
  });
  const path = rawPath.startsWith("#") ? rawPath.slice(1) : rawPath;

  return (
    <Link
      to={path}
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 hover:text-primary-800 transition-colors",
        "dark:text-primary-400 dark:hover:bg-primary-900/30 dark:hover:text-primary-300",
        className,
      )}
    >
      {resolvedLabel}
    </Link>
  );
}
