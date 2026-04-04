import { useInput } from "ra-core";
import { cn } from "@radish-ui/core";

interface TextInputProps {
  /** The field name in the record */
  source: string;
  /** Human-readable label; defaults to a capitalised version of source */
  label?: string;
  /** Optional placeholder text */
  placeholder?: string;
  /** Render a multi-line textarea instead of a single-line input */
  multiline?: boolean;
  /** Number of visible rows when multiline is true. Default: 3 */
  rows?: number;
  className?: string;
}

/**
 * Text input for use inside <SimpleForm>.
 * Wraps ra-core's useInput which ties the field to react-hook-form.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <TextInput source="title" label="Title" />
 * <TextInput source="body" label="Body" multiline rows={5} />
 */
export function TextInput({
  source,
  label,
  placeholder,
  multiline = false,
  rows = 3,
  className,
}: TextInputProps) {
  const {
    id,
    field,
    fieldState: { error },
    isRequired,
  } = useInput({ source });

  const fieldLabel = label ?? capitalize(source);
  const sharedClassName = cn(
    "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm",
    "placeholder:text-gray-400",
    "focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500",
    error && "border-red-500 focus:border-red-500 focus:ring-red-500",
    className,
  );

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {fieldLabel}
        {isRequired && (
          <span className="text-red-500 ml-1" aria-hidden>
            *
          </span>
        )}
      </label>
      {multiline ? (
        <textarea
          {...field}
          id={id}
          rows={rows}
          placeholder={placeholder}
          className={sharedClassName}
        />
      ) : (
        <input
          {...field}
          id={id}
          type="text"
          placeholder={placeholder}
          className={sharedClassName}
        />
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}
