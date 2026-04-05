import { useFieldValue, cn } from "@radish-ui/core";

type ChipColor = "gray" | "indigo" | "green" | "red" | "yellow" | "blue";

interface ChipFieldProps {
  source: string;
  label?: string;
  color?: ChipColor;
  className?: string;
}

const colorMap: Record<ChipColor, string> = {
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  green: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
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
