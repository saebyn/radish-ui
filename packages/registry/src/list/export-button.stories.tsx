import type { Meta, StoryObj } from "@storybook/react";
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
  decorators: [
    (Story) => (
      <MemoryRouter>
        <CoreAdminContext dataProvider={mockDataProvider}>
          <Story />
        </CoreAdminContext>
      </MemoryRouter>
    ),
  ],
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
