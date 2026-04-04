import { useFieldValue, cn } from "@radish-ui/core";

interface UrlFieldProps {
  source: string;
  label?: string;
  /** Max characters to display; the full URL is still used in the href. */
  maxLength?: number;
  /** Link target. Default: "_blank". */
  target?: string;
  className?: string;
}

/**
 * Renders a record field as a clickable `<a href>` hyperlink.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <UrlField source="website" />
 * <UrlField source="profile_url" label="Profile" maxLength={30} />
 */
export function UrlField({ source, maxLength, target = "_blank", className }: UrlFieldProps) {
  const value = useFieldValue({ source });

  if (value === undefined || value === null) {
    return <span className={cn("text-sm text-gray-400 dark:text-gray-500", className)}>—</span>;
  }

  const href = String(value);
  const display = maxLength && href.length > maxLength ? `${href.slice(0, maxLength)}…` : href;

  return (
    <a
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className={cn(
        "text-sm text-indigo-600 underline hover:text-indigo-800",
        "dark:text-indigo-400 dark:hover:text-indigo-300",
        className,
      )}
    >
      {display}
    </a>
  );
}
