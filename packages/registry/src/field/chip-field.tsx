import { useFieldValue, cn } from "@radish-ui/core";

type ChipColor = "gray" | "indigo" | "green" | "red" | "yellow" | "blue";

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
  yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
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
