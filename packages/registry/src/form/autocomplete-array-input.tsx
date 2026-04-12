import { useRef, useState, useEffect, useId } from "react";
import { useInput, useChoicesContext } from "ra-core";
import { cn } from "@radish-ui/core";

export interface AutocompleteArrayChoice {
  id: string | number;
  name: string;
}

interface AutocompleteArrayInputProps {
  /** The field name in the record — should hold an array of ids */
  source: string;
  /** The list of options to display */
  choices?: AutocompleteArrayChoice[];
  /** Human-readable label; defaults to a capitalised version of source */
  label?: string;
  /** Placeholder shown when nothing is selected yet */
  placeholder?: string;
  className?: string;
}

/**
 * Multi-select autocomplete input for array-valued fields.
 * Equivalent to react-admin's <AutocompleteArrayInput>.
 *
 * Renders a tag/chip list of selected values with a searchable dropdown.
 * Uses ra-core's useInput for form integration and useChoicesContext for
 * client-side filtering.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <AutocompleteArrayInput
 *   source="tag_ids"
 *   choices={[
 *     { id: 1, name: 'Sports' },
 *     { id: 2, name: 'Tech' },
 *   ]}
 * />
 */
export function AutocompleteArrayInput({
  source,
  choices: choicesProp,
  label,
  placeholder = "Type to search…",
  className,
}: AutocompleteArrayInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const {
    id,
    field,
    fieldState: { error },
    isRequired,
  } = useInput({
    source,
    // Convert stored values (numbers or strings) → strings for internal use
    format: (value: unknown) => {
      if (!Array.isArray(value)) return [];
      return value.map((item) => String(item));
    },
    // Convert selected strings back to numbers where possible
    parse: (value: string[]) =>
      value.map((item) => {
        const n = Number(item);
        return Number.isFinite(n) ? n : item;
      }),
  });

  const { availableChoices, allChoices, setFilters } = useChoicesContext({
    choices: choicesProp,
    source,
  });

  const selectedValues: string[] = Array.isArray(field.value)
    ? field.value.map((item: unknown) => String(item))
    : [];

  // Choices that are not yet selected
  const dropdownChoices = (availableChoices ?? []).filter(
    (c) => !selectedValues.includes(String(c.id)),
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setFilters({ q: val });
    setIsOpen(true);
  };

  const handleSelect = (choice: AutocompleteArrayChoice) => {
    field.onChange([...selectedValues, String(choice.id)]);
    setInputValue("");
    setFilters({ q: "" });
    inputRef.current?.focus();
  };

  const handleRemove = (idStr: string) => {
    field.onChange(selectedValues.filter((v) => v !== idStr));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
    // Backspace on empty input removes last selected item
    if (e.key === "Backspace" && inputValue === "" && selectedValues.length > 0) {
      handleRemove(selectedValues[selectedValues.length - 1]);
    }
  };

  // Look up the display name for a selected id
  const getChoiceName = (idStr: string): string => {
    const all = (allChoices ?? choicesProp ?? []) as AutocompleteArrayChoice[];
    return all.find((c) => String(c.id) === idStr)?.name ?? idStr;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = isOpen && dropdownChoices.length > 0;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        {label ?? capitalize(source)}
        {isRequired && (
          <span className="ml-1 text-danger-500" aria-hidden>
            *
          </span>
        )}
      </label>

      {/* Input area: chips + text input */}
      <div
        className={cn(
          "flex min-h-10 flex-wrap items-center gap-1 rounded-md border border-neutral-300 bg-canvas-0 px-2 py-1.5",
          "focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500",
          "dark:border-neutral-600 dark:bg-canvas-700",
          "dark:focus-within:border-primary-400 dark:focus-within:ring-primary-400",
          error &&
            "border-danger-500 focus-within:border-danger-500 focus-within:ring-danger-500 dark:border-danger-400 dark:focus-within:border-danger-400 dark:focus-within:ring-danger-400",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {selectedValues.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-0.5 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300"
          >
            {getChoiceName(v)}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(v);
              }}
              className="ml-0.5 rounded-full p-0.5 text-primary-500 hover:bg-primary-200 hover:text-primary-800 dark:text-primary-400 dark:hover:bg-primary-800 dark:hover:text-primary-200"
              aria-label={`Remove ${getChoiceName(v)}`}
            >
              <svg
                aria-hidden
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 14 14"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <line x1="2" y1="2" x2="12" y2="12" />
                <line x1="12" y1="2" x2="2" y2="12" />
              </svg>
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          id={id}
          name={field.name}
          type="text"
          autoComplete="off"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={field.onBlur}
          onKeyDown={handleKeyDown}
          placeholder={selectedValues.length === 0 ? placeholder : ""}
          className="min-w-24 flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-controls={showDropdown ? listboxId : undefined}
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          aria-label={label ?? capitalize(source)}
          className={cn(
            "absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-neutral-200 bg-canvas-0 py-1 shadow-md",
            "dark:border-neutral-700 dark:bg-canvas-800",
          )}
        >
          {dropdownChoices.map((choice) => (
            <li
              key={choice.id}
              role="option"
              aria-selected={false}
              // Use onMouseDown + preventDefault to prevent the input from losing focus
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(choice as AutocompleteArrayChoice);
              }}
              className="cursor-pointer px-3 py-2 text-sm text-neutral-800 hover:bg-primary-50 dark:text-neutral-200 dark:hover:bg-primary-900/40"
            >
              {(choice as AutocompleteArrayChoice).name}
            </li>
          ))}
        </ul>
      )}

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
