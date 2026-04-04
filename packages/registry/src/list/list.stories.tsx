import type { Meta, StoryObj } from "@storybook/react";
import { ListContextProvider } from "ra-core";
import { List } from "./list";
import { Datagrid } from "./datagrid";
import { TextField } from "../field/text-field";

const records = [
  { id: 1, title: "Introduction to React", author: "Alice", year: 2021 },
  { id: 2, title: "Advanced TypeScript", author: "Bob", year: 2022 },
  { id: 3, title: "Tailwind CSS in Practice", author: "Carol", year: 2023 },
];

const baseListContext = {
  total: records.length,
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

const meta: Meta<typeof List> = {
  title: "List/List",
  component: List,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof List>;

export const Default: Story = {
  render: () => (
    <ListContextProvider value={{ ...baseListContext, data: records, isLoading: false }}>
      <List>
        <Datagrid>
          <TextField source="title" label="Title" />
          <TextField source="author" label="Author" />
          <TextField source="year" label="Year" />
        </Datagrid>
      </List>
    </ListContextProvider>
  ),
};

export const WithActions: Story = {
  render: () => (
    <ListContextProvider value={{ ...baseListContext, data: records, isLoading: false }}>
      <List
        actions={
          <button className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
            + Create
          </button>
        }
      >
        <Datagrid>
          <TextField source="title" label="Title" />
          <TextField source="author" label="Author" />
        </Datagrid>
      </List>
    </ListContextProvider>
  ),
};

export const Loading: Story = {
  render: () => (
    <ListContextProvider value={{ ...baseListContext, data: [], isLoading: true, isPending: true }}>
      <List>
        <Datagrid>
          <TextField source="title" label="Title" />
          <TextField source="author" label="Author" />
        </Datagrid>
      </List>
    </ListContextProvider>
  ),
};

export const WithError: Story = {
  render: () => (
    <ListContextProvider
      value={{
        ...baseListContext,
        data: [],
        isLoading: false,
        error: new Error("Failed to fetch posts"),
      }}
    >
      <List>
        <Datagrid>
          <TextField source="title" label="Title" />
        </Datagrid>
      </List>
    </ListContextProvider>
  ),
};
