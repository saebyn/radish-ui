import { useRecordContext, useCreatePath, useResourceContext } from "ra-core";
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
export function EditButton({ resource, label = "Edit", className }: EditButtonProps) {
  const record = useRecordContext();
  const resourceContext = useResourceContext();
  const createPath = useCreatePath();

  if (!record) return null;

  const path = createPath({
    resource: resource ?? resourceContext ?? "",
    type: "edit",
    id: record.id,
  });

  return (
    <Link
      to={path}
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 hover:text-primary-800 transition-colors",
        "dark:text-primary-400 dark:hover:bg-primary-900/30 dark:hover:text-primary-300",
        className,
      )}
    >
      {label}
    </Link>
  );
}
