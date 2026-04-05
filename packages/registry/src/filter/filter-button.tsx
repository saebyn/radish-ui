import { useListContext } from "ra-core";
import { cn } from "@radish-ui/core";

interface FilterButtonProps {
  /** Label shown on the button. Default: "Filters". */
  label?: string;
  className?: string;
}

/**
 * Button that toggles the filter form open/closed.
 * Reads `displayedFilters` and calls `showFilter` / `hideFilter` from `useListContext`.
 *
 * Drop this into the `<List actions>` slot alongside a `<CreateButton>`.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <List actions={<><FilterButton /><CreateButton /></>}>
 *   ...
 * </List>
 */
export function FilterButton({ label = "Filters", className }: FilterButtonProps) {
  const { showFilter, hideFilter, displayedFilters } = useListContext();

  const isOpen = !!displayedFilters["__filterForm"];

  const toggle = () => {
    if (isOpen) {
      hideFilter("__filterForm");
    } else {
      showFilter("__filterForm", undefined);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={isOpen}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm",
        "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
        "dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
        isOpen &&
          "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300",
        className,
      )}
    >
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z"
          clipRule="evenodd"
        />
      </svg>
      {label}
    </button>
  );
}
