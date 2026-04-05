import { useInput, useGetList } from "ra-core";
import { cn } from "@radish-ui/core";

interface ReferenceInputProps {
  /** The source field on the current record (the foreign key). */
  source: string;
  /** The name of the referenced resource to load choices from. */
  reference: string;
  /** The field on the referenced record to display in the dropdown. Default: "name". */
  optionText?: string;
  /** Human-readable label; defaults to a capitalised version of source. */
  label?: string;
  /** Placeholder option. Default: "— select —". */
  emptyText?: string;
  /** Number of choices to load. Default: 25. */
  perPage?: number;
  /**
   * Convert the select's string value into the form field value.
   * Defaults to returning the raw string as-is, with an empty string becoming `null`.
   * Pass a custom `parse` prop if you need numeric IDs (e.g. `(v) => v === "" ? null : Number(v)`).
   */
  parse?: (value: string) => unknown;
  /**
   * Convert the form field value into the select's string value.
   * Defaults to `String(v)` (empty string for null/undefined).
   */
  format?: (value: unknown) => string;
  className?: string;
}

/**
 * Select dropdown that loads choices from another resource.
 * For use inside `<SimpleForm>`, `<Edit>`, or `<Create>`.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <ReferenceInput source="authorId" reference="authors" optionText="name" />
 */
export function ReferenceInput({
  source,
  reference,
  optionText = "name",
  label,
  emptyText = "— select —",
  perPage = 25,
  parse,
  format,
  className,
}: ReferenceInputProps) {
  const {
    id,
    field,
    fieldState: { error },
    isRequired,
  } = useInput({
    source,
    format: format ?? ((v: unknown) => (v == null ? "" : String(v))),
    parse:
      parse ??
      ((v: string) => {
        if (v === "") return null;
        return v;
      }),
  });

  const { data: choices, isLoading } = useGetList(reference, {
    pagination: { page: 1, perPage },
    sort: { field: optionText, order: "ASC" },
  });

  const fieldLabel = label ?? capitalize(source);

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
      >
        {fieldLabel}
        {isRequired && (
          <span className="text-danger-500 ml-1" aria-hidden>
            *
          </span>
        )}
      </label>
      <select
        {...field}
        id={id}
        disabled={isLoading}
        className={cn(
          "block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm",
          "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
          "dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100",
          "dark:focus:border-primary-400 dark:focus:ring-primary-400",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          error &&
            "border-danger-500 focus:border-danger-500 focus:ring-danger-500 dark:border-danger-400 dark:focus:border-danger-400 dark:focus:ring-danger-400",
          className,
        )}
      >
        <option value="">{isLoading ? "Loading…" : emptyText}</option>
        {(choices ?? []).map((choice) => (
          <option key={choice.id} value={String(choice.id)}>
            {String((choice as Record<string, unknown>)[optionText] ?? choice.id)}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-danger-600 dark:text-danger-400" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}
