import type { Meta, StoryObj } from "@storybook/react";
import { ListContextProvider } from "ra-core";
import { ExportButton } from "./export-button";

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
  data: [
    { id: 1, title: "Post A", author: "Alice" },
    { id: 2, title: "Post B", author: "Bob" },
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

const meta: Meta<typeof ExportButton> = {
  title: "List/ExportButton",
  component: ExportButton,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ExportButton>;

export const Default: Story = {
  render: () => (
    <ListContextProvider value={baseListContext}>
      <ExportButton />
    </ListContextProvider>
  ),
};

export const Disabled: Story = {
  render: () => (
    <ListContextProvider value={{ ...baseListContext, data: [], total: 0 }}>
      <ExportButton />
    </ListContextProvider>
  ),
};
