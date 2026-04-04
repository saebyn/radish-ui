import { useInput } from "ra-core";

interface BooleanInputProps {
  /** The field name in the record */
  source: string;
  /** Human-readable label; defaults to a capitalised version of source */
  label?: string;
  className?: string;
}

/**
 * Checkbox (boolean) input for use inside <SimpleForm>.
 * Wraps ra-core's useInput.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <BooleanInput source="is_published" label="Published?" />
 */
export function BooleanInput({ source, label, className }: BooleanInputProps) {
  const {
    id,
    field: { value, onChange, onBlur, ref, name },
    fieldState: { error },
    isRequired,
  } = useInput({
    source,
    // Normalize any serialized boolean value to a real boolean
    format: (v: unknown) => v === true || v === 1 || v === "true" || v === "1",
    // Always store a boolean, not a string
    parse: (v: boolean) => v,
  });

  const fieldLabel = label ?? capitalize(source);

  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-center gap-3 cursor-pointer select-none">
        <input
          ref={ref}
          id={id}
          name={name}
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {fieldLabel}
          {isRequired && (
            <span className="text-red-500 ml-1" aria-hidden>
              *
            </span>
          )}
        </span>
      </label>
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
