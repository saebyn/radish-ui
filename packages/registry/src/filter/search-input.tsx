import React, { useEffect, useRef, useState } from "react";
import { useListContext } from "ra-core";
import { cn } from "@radish-ui/core";

interface SearchInputProps {
  /** Filter key to use. Defaults to "q". */
  source?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Debounce delay in milliseconds. Default: 300. */
  debounce?: number;
  className?: string;
}

/**
 * Debounced search input pre-wired to the list filter context.
 * Typically used inside a <FilterForm> or directly in the <List actions> slot.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <List filters={<FilterForm><SearchInput /></FilterForm>}>
 *   ...
 * </List>
 */
export function SearchInput({
  source = "q",
  placeholder = "Search…",
  debounce = 300,
  className,
}: SearchInputProps) {
  const { filterValues, setFilters, displayedFilters } = useListContext();
  const [value, setValue] = useState<string>((filterValues[source] as string) ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local value in sync when filterValues changes externally
  useEffect(() => {
    setValue((filterValues[source] as string) ?? "");
  }, [filterValues, source]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const newFilters = { ...filterValues, [source]: next };
      if (!next) delete newFilters[source];
      setFilters(newFilters, displayedFilters);
    }, debounce);
  };

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <input
      type="search"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      aria-label={placeholder}
      className={cn(
        "block rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm",
        "placeholder:text-gray-400",
        "focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500",
        "dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500",
        "dark:focus:border-indigo-400 dark:focus:ring-indigo-400",
        className,
      )}
    />
  );
}
