import { useInput } from "ra-core";
import { cn } from "@radish-ui/core";

interface NumberInputProps {
  /** The field name in the record */
  source: string;
  /** Human-readable label; defaults to a capitalised version of source */
  label?: string;
  /** Optional placeholder */
  placeholder?: string;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Increment step */
  step?: number;
  className?: string;
}

/**
 * Numeric input for use inside <SimpleForm>.
 * Wraps ra-core's useInput. Parses the value to a number on change.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <NumberInput source="price" label="Price" min={0} step={0.01} />
 */
export function NumberInput({
  source,
  label,
  placeholder,
  min,
  max,
  step,
  className,
}: NumberInputProps) {
  const {
    id,
    field,
    fieldState: { error },
    isRequired,
  } = useInput({
    source,
    // parse string value from the DOM to a number for ra-core
    parse: (v: string) => (v === "" ? null : Number(v)),
    // format undefined/null to empty string for the DOM
    format: (v: unknown) => (v == null ? "" : String(v)),
  });

  const fieldLabel = label ?? capitalize(source);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {fieldLabel}
        {isRequired && (
          <span className="text-red-500 ml-1" aria-hidden>
            *
          </span>
        )}
      </label>
      <input
        {...field}
        id={id}
        type="number"
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={cn(
          "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm",
          "placeholder:text-gray-400",
          "focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500",
          "dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500",
          "dark:focus:border-indigo-400 dark:focus:ring-indigo-400",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400",
          className,
        )}
      />
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
