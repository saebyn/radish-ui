import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListContextProvider } from "ra-core";
import { MemoryRouter } from "react-router-dom";
import { Datagrid } from "./datagrid";
import { TextField } from "../field/text-field";

const records = [
  { id: 1, title: "First Post", author: "Alice" },
  { id: 2, title: "Second Post", author: "Bob" },
];

const baseListContext = {
  total: 0,
  isPending: false,
  isFetching: false,
  page: 1,
  perPage: 10,
  sort: { field: "id", order: "ASC" as const },
  filterValues: {},
  displayedFilters: {},
  defaultTitle: "Posts",
  resource: "posts",
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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("Datagrid", () => {
  it("renders column headers derived from child label props", () => {
    render(
      <ListContextProvider
        value={{ ...baseListContext, data: records, total: records.length, isLoading: false }}
      >
        <Datagrid>
          <TextField source="title" label="Title" />
          <TextField source="author" label="Author" />
        </Datagrid>
      </ListContextProvider>,
      { wrapper },
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Author")).toBeInTheDocument();
  });

  it("capitalises source as header when no label prop is given", () => {
    render(
      <ListContextProvider
        value={{ ...baseListContext, data: records, total: records.length, isLoading: false }}
      >
        <Datagrid>
          <TextField source="title" />
        </Datagrid>
      </ListContextProvider>,
      { wrapper },
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("renders one row per record", () => {
    render(
      <ListContextProvider
        value={{ ...baseListContext, data: records, total: records.length, isLoading: false }}
      >
        <Datagrid>
          <TextField source="title" label="Title" />
        </Datagrid>
      </ListContextProvider>,
      { wrapper },
    );
    expect(screen.getByText("First Post")).toBeInTheDocument();
    expect(screen.getByText("Second Post")).toBeInTheDocument();
  });

  it("shows loading indicator while isLoading is true", () => {
    render(
      <ListContextProvider value={{ ...baseListContext, data: [], isLoading: true }}>
        <Datagrid>
          <TextField source="title" label="Title" />
        </Datagrid>
      </ListContextProvider>,
      { wrapper },
    );
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  it("shows empty state when data is empty and not loading", () => {
    render(
      <ListContextProvider value={{ ...baseListContext, data: [], isLoading: false }}>
        <Datagrid>
          <TextField source="title" label="Title" />
        </Datagrid>
      </ListContextProvider>,
      { wrapper },
    );
    expect(screen.getByText(/No records found/)).toBeInTheDocument();
  });

  it("renders row actions column when rowActions prop is provided", () => {
    render(
      <ListContextProvider
        value={{ ...baseListContext, data: records, total: records.length, isLoading: false }}
      >
        <Datagrid rowActions={<button>Edit</button>}>
          <TextField source="title" label="Title" />
        </Datagrid>
      </ListContextProvider>,
      { wrapper },
    );
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("renders row actions for each row", () => {
    render(
      <ListContextProvider
        value={{ ...baseListContext, data: records, total: records.length, isLoading: false }}
      >
        <Datagrid rowActions={<button>Edit</button>}>
          <TextField source="title" label="Title" />
        </Datagrid>
      </ListContextProvider>,
      { wrapper },
    );
    // One action button per row
    expect(screen.getAllByText("Edit")).toHaveLength(records.length);
  });

  it("provides a RecordContextProvider for each row so fields resolve correctly", () => {
    render(
      <ListContextProvider
        value={{ ...baseListContext, data: records, total: records.length, isLoading: false }}
      >
        <Datagrid>
          <TextField source="author" label="Author" />
        </Datagrid>
      </ListContextProvider>,
      { wrapper },
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("table has aria-label from defaultTitle when no label prop is given", () => {
    const { container } = render(
      <ListContextProvider
        value={{
          ...baseListContext,
          data: records,
          total: records.length,
          isLoading: false,
          defaultTitle: "Posts",
        }}
      >
        <Datagrid>
          <TextField source="title" label="Title" />
        </Datagrid>
      </ListContextProvider>,
      { wrapper },
    );
    expect(container.querySelector("table")).toHaveAttribute("aria-label", "Posts");
  });

  it("table has aria-label from the label prop when provided", () => {
    const { container } = render(
      <ListContextProvider
        value={{ ...baseListContext, data: records, total: records.length, isLoading: false }}
      >
        <Datagrid label="My custom label">
          <TextField source="title" label="Title" />
        </Datagrid>
      </ListContextProvider>,
      { wrapper },
    );
    expect(container.querySelector("table")).toHaveAttribute("aria-label", "My custom label");
  });
});
