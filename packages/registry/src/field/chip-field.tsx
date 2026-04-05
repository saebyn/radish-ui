import { useFieldValue, cn } from "@radish-ui/core";

type ChipColor = "gray" | "indigo" | "green" | "red" | "warning" | "info";

interface ChipFieldProps {
  source: string;
  label?: string;
  color?: ChipColor;
  className?: string;
}

const colorMap: Record<ChipColor, string> = {
  gray: "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200",
  indigo: "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  green: "bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300",
  red: "bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300",
  warning: "bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300",
  info: "bg-info-100 text-info-700 dark:bg-info-900/40 dark:text-info-300",
};

/**
 * Renders a field value as a styled chip / badge.
 * Useful inside `<ArrayField>` or standalone.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <ChipField source="status" color="green" />
 */
export function ChipField({ source, color = "gray", className }: ChipFieldProps) {
  const value = useFieldValue({ source });

  if (value === undefined || value === null) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorMap[color],
        className,
      )}
    >
      {String(value)}
    </span>
  );
}
