import { useFieldValue, cn } from "@radish-ui/core";

interface NumberFieldProps {
  source: string;
  label?: string;
  /** Options forwarded to Intl.NumberFormat */
  options?: Intl.NumberFormatOptions;
  /** Locale for formatting. Defaults to the browser locale */
  locales?: string | string[];
  className?: string;
}

/**
 * Numeric field with locale-aware formatting via Intl.NumberFormat.
 * Uses useFieldValue from @radish-ui/core.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <NumberField source="price" options={{ style: "currency", currency: "USD" }} />
 * <NumberField source="views" options={{ notation: "compact" }} />
 */
export function NumberField({ source, options, locales, className }: NumberFieldProps) {
  const value = useFieldValue({ source });

  if (value == null) {
    return <span className={cn("text-sm text-gray-400 dark:text-gray-500", className)}>—</span>;
  }

  const num = Number(value);
  if (isNaN(num)) {
    return <span className={cn("text-sm text-gray-700 dark:text-gray-300", className)}>{String(value)}</span>;
  }

  const formatted = new Intl.NumberFormat(locales, options).format(num);

  return <span className={cn("text-sm text-gray-700 dark:text-gray-300 tabular-nums", className)}>{formatted}</span>;
}
