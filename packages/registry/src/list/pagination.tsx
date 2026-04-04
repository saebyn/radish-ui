import { useListContext } from "ra-core";
import { cn } from "@radish-ui/core";

interface PaginationProps {
  /** Number of page buttons to show around the current page. Default 2. */
  siblingCount?: number;
  className?: string;
}

/**
 * Pagination bar that reads page/perPage/total from useListContext.
 * Renders Previous / page numbers / Next controls.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <List resource="posts" pagination={<Pagination />}>
 *   <Datagrid>...</Datagrid>
 * </List>
 */
export function Pagination({ siblingCount = 2, className }: PaginationProps) {
  const { page, perPage, total, setPage } = useListContext();

  if (total === undefined || total === null) return null;

  const pageCount = Math.ceil(total / perPage);
  if (pageCount <= 1) return null;

  const pages = buildPageRange(page, pageCount, siblingCount);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-between px-1 py-3 text-sm", className)}
    >
      <p className="text-gray-500 dark:text-gray-400">
        {total} result{total !== 1 ? "s" : ""}
      </p>

      <ul className="flex items-center gap-1">
        {/* Previous */}
        <li>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="rounded-md px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            ‹
          </button>
        </li>

        {pages.map((p, i) =>
          p === "…" ? (
            <li key={`ellipsis-${i}`} className="px-2 text-gray-400 dark:text-gray-500 select-none">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                onClick={() => setPage(p as number)}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 transition-colors",
                  p === page
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                )}
              >
                {p}
              </button>
            </li>
          ),
        )}

        {/* Next */}
        <li>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= pageCount}
            className="rounded-md px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            ›
          </button>
        </li>
      </ul>
    </nav>
  );
}

/** Build an array like [1, '…', 4, 5, 6, '…', 10] */
function buildPageRange(current: number, total: number, siblings: number): (number | "…")[] {
  const range: (number | "…")[] = [];
  const left = Math.max(2, current - siblings);
  const right = Math.min(total - 1, current + siblings);

  range.push(1);
  if (left > 2) range.push("…");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("…");
  if (total > 1) range.push(total);

  return range;
}
