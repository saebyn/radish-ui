import { useInput } from "ra-core";
import { cn } from "@radish-ui/core";

export interface SelectChoice {
  id: string;
  name: string;
}

interface SelectInputProps {
  /** The field name in the record */
  source: string;
  /** The list of options to display */
  choices: SelectChoice[];
  /** Human-readable label; defaults to a capitalised version of source */
  label?: string;
  /** Placeholder option text. Default: "— select —" */
  emptyText?: string;
  className?: string;
}

/**
 * Select dropdown input for use inside <SimpleForm>.
 * Wraps ra-core's useInput.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <SelectInput
 *   source="status"
 *   choices={[
 *     { id: 'draft',     name: 'Draft' },
 *     { id: 'published', name: 'Published' },
 *   ]}
 * />
 */
export function SelectInput({
  source,
  choices,
  label,
  emptyText = "— select —",
  className,
}: SelectInputProps) {
  const {
    id,
    field,
    fieldState: { error },
    isRequired,
  } = useInput({
    source,
    // HTML <select> always yields a string; normalise the stored value to string
    format: (v: unknown) => (v == null ? "" : String(v)),
    parse: (v: string) => (v === "" ? null : v),
  });

  const fieldLabel = label ?? capitalize(source);

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {fieldLabel}
        {isRequired && (
          <span className="text-red-500 ml-1" aria-hidden>
            *
          </span>
        )}
      </label>
      <select
        {...field}
        id={id}
        className={cn(
          "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm",
          "focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500",
          "dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100",
          "dark:focus:border-indigo-400 dark:focus:ring-indigo-400",
          error &&
            "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400",
          className,
        )}
      >
        <option value="">{emptyText}</option>
        {choices.map((choice) => (
          <option key={choice.id} value={choice.id}>
            {choice.name}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}
