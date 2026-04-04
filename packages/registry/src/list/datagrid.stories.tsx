import type { Meta, StoryObj } from "@storybook/react";
import { ListContextProvider } from "ra-core";
import { Datagrid } from "./datagrid";
import { TextField } from "../field/text-field";

const records = [
  { id: 1, title: "Introduction to React", author: "Alice", year: 2021 },
  { id: 2, title: "Advanced TypeScript", author: "Bob", year: 2022 },
  { id: 3, title: "Tailwind CSS in Practice", author: "Carol", year: 2023 },
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

const meta: Meta<typeof Datagrid> = {
  title: "List/Datagrid",
  component: Datagrid,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof Datagrid>;

export const Default: Story = {
  render: () => (
    <ListContextProvider
      value={{ ...baseListContext, data: records, total: records.length, isLoading: false }}
    >
      <Datagrid>
        <TextField source="title" label="Title" />
        <TextField source="author" label="Author" />
        <TextField source="year" label="Year" />
      </Datagrid>
    </ListContextProvider>
  ),
};

export const Loading: Story = {
  render: () => (
    <ListContextProvider value={{ ...baseListContext, data: [], isLoading: true, isPending: true }}>
      <Datagrid>
        <TextField source="title" label="Title" />
        <TextField source="author" label="Author" />
      </Datagrid>
    </ListContextProvider>
  ),
};

export const Empty: Story = {
  render: () => (
    <ListContextProvider value={{ ...baseListContext, data: [], isLoading: false }}>
      <Datagrid>
        <TextField source="title" label="Title" />
        <TextField source="author" label="Author" />
      </Datagrid>
    </ListContextProvider>
  ),
};
