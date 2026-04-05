import { useCreatePath, useResourceContext, useTranslate } from "ra-core";
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
export function CreateButton({ resource, label, className }: CreateButtonProps) {
  const translate = useTranslate();
  const resourceContext = useResourceContext();
  const createPath = useCreatePath();
  const resolvedLabel = label ?? translate("ra.action.create", { _: "Create" });

  const path = createPath({ resource: resource ?? resourceContext ?? "", type: "create" });

  return (
    <Link
      to={path}
      className={cn(
        "inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors",
        className,
      )}
    >
      {resolvedLabel}
    </Link>
  );
}
