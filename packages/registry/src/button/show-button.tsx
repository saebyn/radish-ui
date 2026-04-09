import { useRecordContext, useCreatePath, useResourceContext, useTranslate } from "ra-core";
import { Link } from "react-router-dom";
import { cn } from "@radish-ui/core";

interface ShowButtonProps {
  /** Override the resource name. Defaults to the current ResourceContext. */
  resource?: string;
  label?: string;
  className?: string;
}

/**
 * Show button for use inside a Datagrid row.
 * Navigates to the show view of the current record.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <Datagrid>
 *   <TextField source="title" />
 *   <ShowButton />
 * </Datagrid>
 */
export function ShowButton({ resource, label, className }: ShowButtonProps) {
  const translate = useTranslate();
  const record = useRecordContext();
  const resourceContext = useResourceContext();
  const createPath = useCreatePath();
  const resolvedLabel = label ?? translate("ra.action.show", { _: "Show" });

  const resolvedResource = resource ?? resourceContext;
  if (!record || !resolvedResource) return null;

  const rawPath = createPath({
    resource: resolvedResource,
    type: "show",
    id: record.id,
  });
  const path = rawPath.startsWith("#") ? rawPath.slice(1) : rawPath;

  return (
    <Link
      to={path}
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 transition-colors",
        "dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200",
        className,
      )}
    >
      {resolvedLabel}
    </Link>
  );
}
