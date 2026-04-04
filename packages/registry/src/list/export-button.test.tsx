import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ListContextProvider, CoreAdminContext } from "ra-core";
import { MemoryRouter } from "react-router-dom";
import { ExportButton } from "./export-button";

const noop = () => Promise.resolve({ data: [] as never });

const mockDataProvider = {
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getOne: () => Promise.resolve({ data: { id: 1 } as never }),
  getMany: noop,
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  create: () => Promise.resolve({ data: { id: 2 } as never }),
  update: () => Promise.resolve({ data: { id: 1 } as never }),
  updateMany: noop,
  delete: noop,
  deleteMany: noop,
};

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

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <CoreAdminContext dataProvider={mockDataProvider}>
        <ListContextProvider value={baseListContext}>{children}</ListContextProvider>
      </CoreAdminContext>
    </MemoryRouter>
  );
}

describe("ExportButton", () => {
  it("renders with default label", () => {
    render(<ExportButton />, { wrapper: Wrapper });
    expect(screen.getByRole("button", { name: /Export/i })).toBeInTheDocument();
  });

  it("renders with a custom label", () => {
    render(<ExportButton label="Download CSV" />, { wrapper: Wrapper });
    expect(screen.getByRole("button", { name: /Download CSV/i })).toBeInTheDocument();
  });

  it("is disabled when data is empty", () => {
    render(
      <MemoryRouter>
        <CoreAdminContext dataProvider={mockDataProvider}>
          <ListContextProvider value={{ ...baseListContext, data: [], total: 0 }}>
            <ExportButton />
          </ListContextProvider>
        </CoreAdminContext>
      </MemoryRouter>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled while loading", () => {
    render(
      <MemoryRouter>
        <CoreAdminContext dataProvider={mockDataProvider}>
          <ListContextProvider value={{ ...baseListContext, isLoading: true }}>
            <ExportButton />
          </ListContextProvider>
        </CoreAdminContext>
      </MemoryRouter>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls the exporter with the current data when clicked", () => {
    const exporter = vi.fn();
    render(<ExportButton exporter={exporter} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole("button"));
    expect(exporter).toHaveBeenCalledWith(
      baseListContext.data,
      expect.any(Function),
      expect.objectContaining({ getMany: expect.any(Function) }),
      "posts",
    );
  });
});
