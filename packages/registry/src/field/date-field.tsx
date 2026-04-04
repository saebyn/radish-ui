import { useFieldValue, cn } from "@radish-ui/core";

interface DateFieldProps {
  source: string;
  label?: string;
  /** Show time in addition to date. Default: false */
  showTime?: boolean;
  /** Options forwarded to Intl.DateTimeFormat. Overrides showTime if provided */
  options?: Intl.DateTimeFormatOptions;
  /** Locale for formatting. Defaults to the browser locale */
  locales?: string | string[];
  className?: string;
}

/**
 * Date field with locale-aware formatting via Intl.DateTimeFormat.
 * Accepts ISO strings, timestamps (numbers), or Date objects.
 * Uses useFieldValue from @radish-ui/core.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <DateField source="created_at" />
 * <DateField source="published_at" showTime />
 * <DateField source="due_date" options={{ dateStyle: "long" }} />
 */
export function DateField({
  source,
  showTime = false,
  options,
  locales,
  className,
}: DateFieldProps) {
  const value = useFieldValue({ source });

  if (value == null || value === "") {
    return <span className={cn("text-sm text-gray-400", className)}>—</span>;
  }

  const date = value instanceof Date ? value : new Date(value as string | number);

  if (isNaN(date.getTime())) {
    return <span className={cn("text-sm text-gray-700", className)}>{String(value)}</span>;
  }

  const formatOptions: Intl.DateTimeFormatOptions = options ?? {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(showTime && { hour: "2-digit", minute: "2-digit" }),
  };

  const formatted = new Intl.DateTimeFormat(locales, formatOptions).format(date);

  return (
    <time dateTime={date.toISOString()} className={cn("text-sm text-gray-700", className)}>
      {formatted}
    </time>
  );
}
