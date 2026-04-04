import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ListContextProvider } from "ra-core";
import { Pagination } from "./pagination";

const basePaginationContext = {
  total: 0,
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
  refetch: () => {},
  setFilters: () => {},
  setPage: vi.fn(),
  setPerPage: () => {},
  setSort: () => {},
  showFilter: () => {},
  hideFilter: () => {},
  onSelect: () => {},
  onToggleItem: () => {},
  onUnselectItems: () => {},
  selectedIds: [],
  data: [],
  hasNextPage: false,
  hasPreviousPage: false,
};

describe("Pagination", () => {
  it("renders nothing when total is undefined", () => {
    const { container } = render(
      <ListContextProvider value={{ ...basePaginationContext, total: undefined }}>
        <Pagination />
      </ListContextProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when there is only one page", () => {
    const { container } = render(
      <ListContextProvider value={{ ...basePaginationContext, total: 5, perPage: 10 }}>
        <Pagination />
      </ListContextProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows the total result count", () => {
    render(
      <ListContextProvider value={{ ...basePaginationContext, total: 25, perPage: 10, page: 1 }}>
        <Pagination />
      </ListContextProvider>,
    );
    expect(screen.getByText(/25 result/)).toBeInTheDocument();
  });

  it("renders Previous and Next buttons", () => {
    render(
      <ListContextProvider value={{ ...basePaginationContext, total: 25, perPage: 10, page: 2 }}>
        <Pagination />
      </ListContextProvider>,
    );
    expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
  });

  it("disables the Previous button on the first page", () => {
    render(
      <ListContextProvider value={{ ...basePaginationContext, total: 25, perPage: 10, page: 1 }}>
        <Pagination />
      </ListContextProvider>,
    );
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
  });

  it("disables the Next button on the last page", () => {
    render(
      <ListContextProvider value={{ ...basePaginationContext, total: 25, perPage: 10, page: 3 }}>
        <Pagination />
      </ListContextProvider>,
    );
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  it("marks the current page button with aria-current=page", () => {
    render(
      <ListContextProvider value={{ ...basePaginationContext, total: 25, perPage: 10, page: 2 }}>
        <Pagination />
      </ListContextProvider>,
    );
    const currentBtn = screen.getByRole("button", { name: "2" });
    expect(currentBtn).toHaveAttribute("aria-current", "page");
  });

  it("calls setPage when a page button is clicked", async () => {
    const setPage = vi.fn();
    render(
      <ListContextProvider
        value={{ ...basePaginationContext, total: 25, perPage: 10, page: 1, setPage }}
      >
        <Pagination />
      </ListContextProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(setPage).toHaveBeenCalledWith(2);
  });

  it("calls setPage(page-1) when Previous is clicked", async () => {
    const setPage = vi.fn();
    render(
      <ListContextProvider
        value={{ ...basePaginationContext, total: 25, perPage: 10, page: 2, setPage }}
      >
        <Pagination />
      </ListContextProvider>,
    );
    fireEvent.click(screen.getByLabelText("Previous page"));
    expect(setPage).toHaveBeenCalledWith(1);
  });

  it("calls setPage(page+1) when Next is clicked", async () => {
    const setPage = vi.fn();
    render(
      <ListContextProvider
        value={{ ...basePaginationContext, total: 25, perPage: 10, page: 1, setPage }}
      >
        <Pagination />
      </ListContextProvider>,
    );
    fireEvent.click(screen.getByLabelText("Next page"));
    expect(setPage).toHaveBeenCalledWith(2);
  });

  it("shows singular 'result' for total of 1", () => {
    render(
      <ListContextProvider value={{ ...basePaginationContext, total: 11, perPage: 10, page: 1 }}>
        <Pagination />
      </ListContextProvider>,
    );
    expect(screen.getByText(/11 results/)).toBeInTheDocument();
  });
});
