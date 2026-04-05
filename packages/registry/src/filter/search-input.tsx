import React, { useEffect, useRef, useState } from "react";
import { useListContext, useTranslate } from "ra-core";
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
  placeholder,
  debounce = 300,
  className,
}: SearchInputProps) {
  const translate = useTranslate();
  const resolvedPlaceholder = placeholder ?? translate("ra.action.search", { _: "Search\u2026" });
  const { filterValues, setFilters, displayedFilters } = useListContext();
  const [value, setValue] = useState<string>((filterValues[source] as string) ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Always reflects the latest filterValues so the debounce callback doesn't
  // close over a stale snapshot and accidentally overwrite concurrent filter changes.
  const filterValuesRef = useRef(filterValues);
  filterValuesRef.current = filterValues;

  // Keep local value in sync when filterValues changes externally
  useEffect(() => {
    setValue((filterValues[source] as string) ?? "");
  }, [filterValues, source]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const newFilters = { ...filterValuesRef.current, [source]: next };
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
      placeholder={resolvedPlaceholder}
      aria-label={resolvedPlaceholder}
      className={cn(
        "block rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm",
        "placeholder:text-neutral-400",
        "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
        "dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500",
        "dark:focus:border-primary-400 dark:focus:ring-primary-400",
        className,
      )}
    />
  );
}
