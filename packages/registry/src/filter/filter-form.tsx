import React from "react";
import { useListContext } from "ra-core";
import { cn } from "@radish-ui/core";

interface FilterFormProps {
  /**
   * Filter input components (e.g. <SearchInput />, <SelectInput source="status" />).
   * Each child receives its value from `filterValues` automatically via `useListContext`.
   */
  children: React.ReactNode;
  /**
   * When true, the filter bar is always visible regardless of `displayedFilters`.
   * Useful when using `FilterForm` as a standalone bar without a `FilterButton`.
   * Default: false.
   */
  alwaysOpen?: boolean;
  className?: string;
}

/**
 * Collapsible inline filter bar that wires into `useListContext`'s
 * `displayedFilters` to show/hide itself.
 *
 * Rendered open when `displayedFilters["__filterForm"]` is truthy (toggled by
 * `<FilterButton>`). Pass `alwaysOpen` to keep it permanently visible as a
 * standalone bar.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <List
 *   actions={<FilterButton />}
 *   filters={
 *     <FilterForm>
 *       <SearchInput />
 *     </FilterForm>
 *   }
 * >
 *   <Datagrid>...</Datagrid>
 * </List>
 */
export function FilterForm({ children, alwaysOpen = false, className }: FilterFormProps) {
  const { displayedFilters, filterValues, setFilters } = useListContext();

  const isOpen = alwaysOpen || !!displayedFilters["__filterForm"];

  const handleReset = () => {
    setFilters({}, displayedFilters);
  };

  if (!isOpen) return null;

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className={cn(
        "flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-canvas-50 px-4 py-3 dark:border-neutral-700 dark:bg-canvas-800/50",
        className,
      )}
    >
      {children}

      {Object.keys(filterValues).length > 0 && (
        <button
          type="button"
          onClick={handleReset}
          className="self-end rounded-md px-3 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          Clear filters
        </button>
      )}
    </form>
  );
}
