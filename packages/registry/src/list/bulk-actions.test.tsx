import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ListContextProvider, ResourceContextProvider, CoreAdminContext } from "ra-core";
import { MemoryRouter } from "react-router-dom";
import { BulkActionsToolbar } from "./bulk-actions-toolbar";
import { BulkDeleteButton } from "./bulk-delete-button";

const noop = () => Promise.resolve({ data: [] as never });

// Minimal i18nProvider that resolves translation keys using the `_` fallback
const testI18nProvider = {
  translate: (key: string, options?: { _?: string; [k: string]: unknown }) =>
    typeof options?._ === "string" ? options._ : key,
  changeLocale: () => Promise.resolve(),
  getLocale: () => "en",
};

function makeDataProvider(deleteManyImpl?: () => void) {
  return {
    getList: () => Promise.resolve({ data: [], total: 0 }),
    getOne: () => Promise.resolve({ data: { id: 1 } as never }),
    getMany: noop,
    getManyReference: () => Promise.resolve({ data: [], total: 0 }),
    create: () => Promise.resolve({ data: { id: 2 } as never }),
    update: () => Promise.resolve({ data: { id: 1 } as never }),
    updateMany: noop,
    delete: noop,
    deleteMany: () => {
      deleteManyImpl?.();
      return Promise.resolve({ data: [1, 2] });
    },
  };
}

const baseListContext = {
  total: 3,
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
  setFilters: () => {},
  setPage: () => {},
  setPerPage: () => {},
  setSort: () => {},
  showFilter: () => {},
  hideFilter: () => {},
  onSelect: () => {},
  onToggleItem: () => {},
  onUnselectItems: () => {},
  selectedIds: [1, 2],
  hasNextPage: false,
  hasPreviousPage: false,
};

function Wrapper({
  children,
  deleteManyImpl,
}: {
  children: React.ReactNode;
  deleteManyImpl?: () => void;
}) {
  return (
    <MemoryRouter>
      <CoreAdminContext
        dataProvider={makeDataProvider(deleteManyImpl)}
        i18nProvider={testI18nProvider}
      >
        <ResourceContextProvider value="posts">
          <ListContextProvider value={baseListContext}>{children}</ListContextProvider>
        </ResourceContextProvider>
      </CoreAdminContext>
    </MemoryRouter>
  );
}

describe("BulkActionsToolbar", () => {
  it("renders when items are selected", () => {
    render(
      <ListContextProvider value={baseListContext}>
        <BulkActionsToolbar>
          <span>Actions</span>
        </BulkActionsToolbar>
      </ListContextProvider>,
    );
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.getByText(/2 items selected/)).toBeInTheDocument();
  });

  it("renders nothing when no items are selected", () => {
    const { container } = render(
      <ListContextProvider value={{ ...baseListContext, selectedIds: [] }}>
        <BulkActionsToolbar>
          <span>Actions</span>
        </BulkActionsToolbar>
      </ListContextProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders children inside the toolbar", () => {
    render(
      <ListContextProvider value={baseListContext}>
        <BulkActionsToolbar>
          <button>Bulk Action</button>
        </BulkActionsToolbar>
      </ListContextProvider>,
    );
    expect(screen.getByRole("button", { name: "Bulk Action" })).toBeInTheDocument();
  });
});

describe("BulkDeleteButton", () => {
  it("renders with default label", () => {
    render(<BulkDeleteButton />, { wrapper: Wrapper });
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("opens confirm dialog when clicked", () => {
    render(<BulkDeleteButton />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText("Delete selected items?")).toBeInTheDocument();
  });

  it("closes dialog when Cancel is clicked", () => {
    render(<BulkDeleteButton />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    // dialog should no longer be open
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
  });
});
