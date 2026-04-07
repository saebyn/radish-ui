import { useInput } from "ra-core";
import { cn } from "@radish-ui/core";

export interface MultiSelectChoice {
  id: string | number;
  name: string;
}

interface MultiSelectInputProps {
  source: string;
  choices: MultiSelectChoice[];
  label?: string;
  className?: string;
}

export function MultiSelectInput({ source, choices, label, className }: MultiSelectInputProps) {
  const {
    id,
    field,
    fieldState: { error },
    isRequired,
  } = useInput({
    source,
    format: (value: unknown) => {
      if (!Array.isArray(value)) return [];
      return value.map((item) => String(item));
    },
    parse: (value: string[]) =>
      value.map((item) => {
        const numberValue = Number(item);
        return Number.isNaN(numberValue) ? item : numberValue;
      }),
  });

  const fieldLabel = label ?? capitalize(source);
  const selectedValues = Array.isArray(field.value)
    ? field.value.map((item: unknown) => String(item))
    : [];

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        {fieldLabel}
        {isRequired && (
          <span className="ml-1 text-danger-500" aria-hidden>
            *
          </span>
        )}
      </label>
      <select
        id={id}
        name={field.name}
        ref={field.ref}
        multiple
        onBlur={field.onBlur}
        value={selectedValues}
        onChange={(event) => {
          const values = Array.from(event.target.selectedOptions).map((option) => option.value);
          field.onChange(values);
        }}
        className={cn(
          "block min-h-32 w-full rounded-md border border-neutral-300 bg-canvas-0 px-3 py-2 text-sm text-neutral-900 shadow-sm",
          "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
          "dark:border-neutral-600 dark:bg-canvas-700 dark:text-neutral-100",
          "dark:focus:border-primary-400 dark:focus:ring-primary-400",
          error &&
            "border-danger-500 focus:border-danger-500 focus:ring-danger-500 dark:border-danger-400 dark:focus:border-danger-400 dark:focus:ring-danger-400",
          className,
        )}
      >
        {choices.map((choice) => (
          <option key={choice.id} value={String(choice.id)}>
            {choice.name}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Hold Ctrl (or Cmd on macOS) to select multiple streams.
      </p>
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
