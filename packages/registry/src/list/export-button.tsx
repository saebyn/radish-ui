import { useListContext, defaultExporter, useDataProvider } from "ra-core";
import { cn } from "@radish-ui/core";

interface ExportButtonProps {
  /** Override the resource name used as the filename. Defaults to resource from context. */
  resource?: string;
  /** Button label. Default: "Export". */
  label?: string;
  /**
   * Custom exporter function. Receives `(data, fetchRelated, dataProvider, resource)`.
   * Defaults to ra-core's `defaultExporter` which downloads a CSV.
   */
  exporter?: typeof defaultExporter;
  className?: string;
}

/**
 * Downloads the current list (with active filters) as a CSV file.
 * Uses ra-core's `defaultExporter` by default.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <List actions={<ExportButton />}>…</List>
 */
export function ExportButton({
  label = "Export",
  exporter = defaultExporter,
  resource,
  className,
}: ExportButtonProps) {
  const { data, resource: contextResource, isLoading } = useListContext();
  const dataProvider = useDataProvider();

  const resourceName = resource ?? contextResource;

  const handleClick = () => {
    if (!data || data.length === 0) return;
    type RecordWithFields = Record<string, unknown>;
    const fetchRelated = (records: unknown[], field: string, relatedResource: string) => {
      const ids = Array.from(
        new Set(
          records
            .map((r) => (r as RecordWithFields)[field])
            .filter((id): id is NonNullable<typeof id> => id != null),
        ),
      );
      return dataProvider
        .getMany(relatedResource, { ids })
        .then(({ data: relatedData }: { data: unknown[] }) => relatedData);
    };
    exporter(data, fetchRelated, dataProvider, resourceName);
  };

  const disabled = isLoading || !data || data.length === 0;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm",
        "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
        className,
      )}
    >
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 3a1 1 0 01.707.293l4 4a1 1 0 01-1.414 1.414L11 6.414V13a1 1 0 11-2 0V6.414L6.707 8.707A1 1 0 015.293 7.293l4-4A1 1 0 0110 3zm-7 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {label}
    </button>
  );
}
