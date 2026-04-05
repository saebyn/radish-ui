import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ListContextProvider } from "ra-core";
import { SearchInput } from "./search-input";
import { FilterButton } from "./filter-button";
import { FilterForm } from "./filter-form";

const baseListContext = {
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
  data: [],
  refetch: () => {},
  setFilters: vi.fn(),
  setPage: () => {},
  setPerPage: () => {},
  setSort: () => {},
  showFilter: vi.fn(),
  hideFilter: vi.fn(),
  onSelect: () => {},
  onToggleItem: () => {},
  onUnselectItems: () => {},
  selectedIds: [],
  hasNextPage: false,
  hasPreviousPage: false,
};

describe("SearchInput", () => {
  it("renders a search input with placeholder", () => {
    render(
      <ListContextProvider value={baseListContext}>
        <SearchInput />
      </ListContextProvider>,
    );
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument();
  });

  it("renders with a custom placeholder", () => {
    render(
      <ListContextProvider value={baseListContext}>
        <SearchInput placeholder="Find posts…" />
      </ListContextProvider>,
    );
    expect(screen.getByPlaceholderText("Find posts…")).toBeInTheDocument();
  });

  it("reflects an existing filter value", () => {
    render(
      <ListContextProvider value={{ ...baseListContext, filterValues: { q: "hello" } }}>
        <SearchInput />
      </ListContextProvider>,
    );
    expect(screen.getByRole("searchbox")).toHaveValue("hello");
  });
});

describe("FilterButton", () => {
  it("renders with default label", () => {
    render(
      <ListContextProvider value={baseListContext}>
        <FilterButton />
      </ListContextProvider>,
    );
    expect(screen.getByRole("button", { name: /Filters/i })).toBeInTheDocument();
  });

  it("calls showFilter when closed and clicked", () => {
    const showFilter = vi.fn();
    render(
      <ListContextProvider value={{ ...baseListContext, showFilter }}>
        <FilterButton />
      </ListContextProvider>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(showFilter).toHaveBeenCalledWith("__filterForm", undefined);
  });

  it("calls hideFilter when open and clicked", () => {
    const hideFilter = vi.fn();
    render(
      <ListContextProvider
        value={{ ...baseListContext, displayedFilters: { __filterForm: true }, hideFilter }}
      >
        <FilterButton />
      </ListContextProvider>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(hideFilter).toHaveBeenCalledWith("__filterForm");
  });

  it("has aria-expanded=true when filter form is open", () => {
    render(
      <ListContextProvider value={{ ...baseListContext, displayedFilters: { __filterForm: true } }}>
        <FilterButton />
      </ListContextProvider>,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });
});

describe("FilterForm", () => {
  it("renders children when displayedFilters includes __filterForm", () => {
    render(
      <ListContextProvider value={{ ...baseListContext, displayedFilters: { __filterForm: true } }}>
        <FilterForm>
          <span>My Filter</span>
        </FilterForm>
      </ListContextProvider>,
    );
    expect(screen.getByText("My Filter")).toBeInTheDocument();
  });

  it("renders nothing when filter form is not displayed", () => {
    const { container } = render(
      <ListContextProvider value={baseListContext}>
        <FilterForm>
          <span>My Filter</span>
        </FilterForm>
      </ListContextProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows Clear filters button when filterValues is non-empty", () => {
    render(
      <ListContextProvider
        value={{
          ...baseListContext,
          displayedFilters: { __filterForm: true },
          filterValues: { q: "hello" },
        }}
      >
        <FilterForm>
          <span>My Filter</span>
        </FilterForm>
      </ListContextProvider>,
    );
    expect(screen.getByRole("button", { name: /Clear filters/i })).toBeInTheDocument();
  });

  it("form element has aria-label 'Filters'", () => {
    const { container } = render(
      <ListContextProvider value={{ ...baseListContext, displayedFilters: { __filterForm: true } }}>
        <FilterForm>
          <span>My Filter</span>
        </FilterForm>
      </ListContextProvider>,
    );
    expect(container.querySelector("form")).toHaveAttribute("aria-label", "Filters");
  });

  it("calls setFilters with empty object when Clear filters is clicked", () => {
    const setFilters = vi.fn();
    render(
      <ListContextProvider
        value={{
          ...baseListContext,
          displayedFilters: { __filterForm: true },
          filterValues: { q: "hello" },
          setFilters,
        }}
      >
        <FilterForm>
          <span>My Filter</span>
        </FilterForm>
      </ListContextProvider>,
    );
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Clear filters/i }));
    });
    expect(setFilters).toHaveBeenCalledWith({}, expect.anything());
  });
});
