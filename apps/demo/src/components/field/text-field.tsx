import { useFieldValue, cn } from "@radish-ui/core";

interface TextFieldProps {
  source: string;
  label?: string;
  className?: string;
}

/**
 * Simple text field component.
 * Uses useFieldValue from @radish-ui/core to resolve the field value from the current record context.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <TextField source="title" />
 * <TextField source="author.name" label="Author" />
 */
export function TextField({ source, className }: TextFieldProps) {
  const value = useFieldValue({ source });
  return (
    <span className={cn("text-sm text-neutral-700 dark:text-neutral-300", className)}>
      {value !== undefined && value !== null ? String(value) : "—"}
    </span>
  );
}
