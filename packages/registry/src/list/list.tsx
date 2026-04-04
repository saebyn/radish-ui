import React from "react";
import { ListBase, useListContext } from "ra-core";
import { cn } from "@radish-ui/core";

interface SortPayload {
  field: string;
  order: "ASC" | "DESC";
}

interface ListProps {
  /**
   * The datagrid or other list content.
   * Equivalent to react-admin <List> children prop.
   */
  children: React.ReactNode;
  /** The resource name, e.g. "posts". Deduced from URL if omitted. */
  resource?: string;
  /** Default sort: { field, order }. */
  sort?: SortPayload;
  /** Permanent filter object applied to every request. */
  filter?: object;
  /** Default filter values shown in the filter form. */
  filterDefaultValues?: object;
  /** Number of records per page. Default 10. */
  perPage?: number;
  /** Options passed to react-query's useQuery for the list request. */
  queryOptions?: object;
  /** Disable sync of list params (sort, page, filters) with the URL. */
  disableSyncWithLocation?: boolean;
  /** Store key for persisting list params. Pass false to disable. */
  storeKey?: string | false;
  /** Toolbar rendered above the list (e.g. a CreateButton). */
  actions?: React.ReactNode;
  /** Sidebar component rendered alongside the list. */
  aside?: React.ReactNode;
  /** Filter inputs rendered in the toolbar. */
  filters?: React.ReactElement | React.ReactElement[];
  /** Pagination component rendered below the list. */
  pagination?: React.ReactNode;
  /** Component shown when there are no records. Pass false to disable. */
  empty?: React.ReactNode | false;
  /** Return null while the list is loading instead of rendering children. */
  emptyWhileLoading?: boolean;
  /** Page title override. Pass false to disable. */
  title?: React.ReactNode | string | false;
  className?: string;
}

/**
 * List page component — drop-in replacement for react-admin's <List>.
 *
 * Unlike `<ListBase>` + a separate layout component, this component handles
 * wrapping <ListBase> internally. The API matches react-admin's <List> so you
 * can swap one for the other without changing any other code.
 *
 * @example
 * // Identical usage to react-admin's <List>
 * export const PostList = () => (
 *   <List sort={{ field: "title", order: "ASC" }} perPage={25}>
 *     <Datagrid>
 *       <TextField source="title" />
 *     </Datagrid>
 *   </List>
 * );
 */
export function List({
  children,
  resource,
  sort,
  filter,
  filterDefaultValues,
  perPage = 10,
  queryOptions,
  disableSyncWithLocation,
  storeKey,
  actions,
  aside,
  filters,
  pagination,
  empty,
  emptyWhileLoading,
  title,
  className,
}: ListProps) {
  return (
    <ListBase
      resource={resource}
      sort={sort}
      filter={filter}
      filterDefaultValues={filterDefaultValues}
      perPage={perPage}
      queryOptions={queryOptions}
      disableSyncWithLocation={disableSyncWithLocation}
      storeKey={storeKey}
    >
      <ListLayout
        actions={actions}
        aside={aside}
        filters={filters}
        pagination={pagination}
        empty={empty}
        emptyWhileLoading={emptyWhileLoading}
        title={title}
        className={className}
      >
        {children}
      </ListLayout>
    </ListBase>
  );
}

// ─── Internal layout component ────────────────────────────────────────────────

interface ListLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  filters?: React.ReactNode;
  pagination?: React.ReactNode;
  empty?: React.ReactNode | false;
  emptyWhileLoading?: boolean;
  title?: React.ReactNode | string | false;
  className?: string;
}

function ListLayout({
  children,
  actions,
  aside,
  filters,
  pagination,
  empty,
  emptyWhileLoading,
  title,
  className,
}: ListLayoutProps) {
  const { defaultTitle, error, isLoading, total } = useListContext();

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        <strong>Error loading data:</strong>{" "}
        {error instanceof Error ? error.message : String(error)}
      </div>
    );
  }

  if (emptyWhileLoading && isLoading) {
    return null;
  }

  const displayTitle = title === false ? null : (title ?? defaultTitle);
  const isEmpty = !isLoading && total === 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Page header */}
      <div className="flex items-center justify-between">
        {displayTitle && <h1 className="text-2xl font-bold text-gray-800">{displayTitle}</h1>}
        {actions && <div>{actions}</div>}
      </div>

      {/* Filters */}
      {filters && <div>{filters}</div>}

      {/* Content + optional aside */}
      <div className="flex gap-4">
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">Loading…</div>
          ) : isEmpty && empty !== false ? (
            empty != null ? (
              <>{empty}</>
            ) : (
              <div className="py-12 text-center text-gray-500">No records found.</div>
            )
          ) : (
            children
          )}
        </div>
        {aside && <div className="w-64 shrink-0">{aside}</div>}
      </div>

      {pagination && <div className="border-t border-gray-100 pt-3">{pagination}</div>}
    </div>
  );
}
