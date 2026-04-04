import type { Meta, StoryObj } from "@storybook/react";
import { ListContextProvider, ResourceContextProvider, CoreAdminContext } from "ra-core";
import { MemoryRouter } from "react-router-dom";
import { BulkActionsToolbar } from "./bulk-actions-toolbar";
import { BulkDeleteButton } from "./bulk-delete-button";

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
    { id: 1, title: "Post A" },
    { id: 2, title: "Post B" },
    { id: 3, title: "Post C" },
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
  selectedIds: [1, 2],
  hasNextPage: false,
  hasPreviousPage: false,
};

const meta: Meta = {
  title: "List/BulkActions",
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <CoreAdminContext dataProvider={mockDataProvider}>
          <ResourceContextProvider value="posts">
            <Story />
          </ResourceContextProvider>
        </CoreAdminContext>
      </MemoryRouter>
    ),
  ],
};

export default meta;

export const ToolbarWithSelection: StoryObj = {
  name: "BulkActionsToolbar – items selected",
  render: () => (
    <ListContextProvider value={baseListContext}>
      <BulkActionsToolbar>
        <BulkDeleteButton />
      </BulkActionsToolbar>
    </ListContextProvider>
  ),
};

export const ToolbarHiddenWhenEmpty: StoryObj = {
  name: "BulkActionsToolbar – no selection (hidden)",
  render: () => (
    <ListContextProvider value={{ ...baseListContext, selectedIds: [] }}>
      <BulkActionsToolbar>
        <BulkDeleteButton />
      </BulkActionsToolbar>
      <p className="text-sm text-gray-500 mt-2">Toolbar is hidden when nothing is selected.</p>
    </ListContextProvider>
  ),
};
