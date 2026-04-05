import type { Meta, StoryObj } from "@storybook/react";
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
  displayedFilters: { __filterForm: true },
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
  selectedIds: [],
  hasNextPage: false,
  hasPreviousPage: false,
};

const meta: Meta = {
  title: "Filter/FilterForm",
  parameters: { layout: "padded" },
};

export default meta;

export const DefaultSearchInput: StoryObj = {
  name: "SearchInput",
  render: () => (
    <ListContextProvider value={baseListContext}>
      <SearchInput />
    </ListContextProvider>
  ),
};

export const FilterButtonClosed: StoryObj = {
  name: "FilterButton (closed)",
  render: () => (
    <ListContextProvider value={{ ...baseListContext, displayedFilters: {} }}>
      <FilterButton />
    </ListContextProvider>
  ),
};

export const FilterButtonOpen: StoryObj = {
  name: "FilterButton (open)",
  render: () => (
    <ListContextProvider value={baseListContext}>
      <FilterButton />
    </ListContextProvider>
  ),
};

export const DefaultFilterForm: StoryObj = {
  name: "FilterForm with SearchInput",
  render: () => (
    <ListContextProvider value={baseListContext}>
      <FilterForm>
        <SearchInput />
      </FilterForm>
    </ListContextProvider>
  ),
};

export const FilterFormWithActiveFilters: StoryObj = {
  name: "FilterForm with active filters (Clear button visible)",
  render: () => (
    <ListContextProvider value={{ ...baseListContext, filterValues: { q: "hello" } }}>
      <FilterForm>
        <SearchInput />
      </FilterForm>
    </ListContextProvider>
  ),
};
