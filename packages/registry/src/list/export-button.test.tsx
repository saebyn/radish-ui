import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ListContextProvider } from "ra-core";
import { ExportButton } from "./export-button";

const baseListContext = {
  total: 2,
  isPending: false,
  isFetching: false,
  isLoading: false,
  page: 1,
  perPage: 10,
  sort: { field: "id", order: "ASC" as const },
  filterValues: {},
  displayedFilters: {},
  defaultTitle: "Posts",
  resource: "posts",
  data: [
    { id: 1, title: "Post A" },
    { id: 2, title: "Post B" },
  ],
  refetch: () => {},
  setFilters: () => {},
  setPage: () => {},
  setPerPage: () => {},
  setSort: () => {},
  showFilter: () => {},
  hideFilter: () => {},
  onSelect: () => {},
  onToggleItem: () => {},
  onUnselectItems: () => {},
  selectedIds: [],
  hasNextPage: false,
  hasPreviousPage: false,
};

describe("ExportButton", () => {
  it("renders with default label", () => {
    render(
      <ListContextProvider value={baseListContext}>
        <ExportButton />
      </ListContextProvider>,
    );
    expect(screen.getByRole("button", { name: /Export/i })).toBeInTheDocument();
  });

  it("renders with a custom label", () => {
    render(
      <ListContextProvider value={baseListContext}>
        <ExportButton label="Download CSV" />
      </ListContextProvider>,
    );
    expect(screen.getByRole("button", { name: /Download CSV/i })).toBeInTheDocument();
  });

  it("is disabled when data is empty", () => {
    render(
      <ListContextProvider value={{ ...baseListContext, data: [], total: 0 }}>
        <ExportButton />
      </ListContextProvider>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled while loading", () => {
    render(
      <ListContextProvider value={{ ...baseListContext, isLoading: true }}>
        <ExportButton />
      </ListContextProvider>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls the exporter with the current data when clicked", () => {
    const exporter = vi.fn();
    render(
      <ListContextProvider value={baseListContext}>
        <ExportButton exporter={exporter} />
      </ListContextProvider>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(exporter).toHaveBeenCalledWith(
      baseListContext.data,
      expect.any(Function),
      null,
      "posts",
    );
  });
});
