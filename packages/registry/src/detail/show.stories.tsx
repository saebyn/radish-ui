import type { Meta, StoryObj } from "@storybook/react";
import { CoreAdminContext, TestMemoryRouter } from "ra-core";
import React from "react";
import { Show } from "./show";
import { SimpleShowLayout } from "./simple-show-layout";
import { TextField } from "../field/text-field";
import { EditButton } from "../button/edit-button";

const mockRecord = { id: 1, title: "Hello World", body: "Sample body text.", author: "Jane Doe" };

const mockDataProvider = {
  getOne: () => Promise.resolve({ data: mockRecord }),
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  create: () => Promise.resolve({ data: { id: 2 } as never }),
  update: () => Promise.resolve({ data: mockRecord }),
  updateMany: () => Promise.resolve({ data: [] }),
  delete: () => Promise.resolve({ data: mockRecord }),
  deleteMany: () => Promise.resolve({ data: [] }),
};

const meta: Meta<typeof Show> = {
  title: "Detail/Show",
  component: Show,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof Show>;

export const Default: Story = {
  name: "Basic Show",
  render: () => (
    <TestMemoryRouter>
      <CoreAdminContext dataProvider={mockDataProvider}>
        <Show resource="posts" id={1}>
          <SimpleShowLayout>
            <TextField source="title" />
            <TextField source="body" />
            <TextField source="author" />
          </SimpleShowLayout>
        </Show>
      </CoreAdminContext>
    </TestMemoryRouter>
  ),
};

export const WithActions: Story = {
  name: "With Actions",
  render: () => (
    <TestMemoryRouter>
      <CoreAdminContext dataProvider={mockDataProvider}>
        <Show resource="posts" id={1} actions={<EditButton />}>
          <SimpleShowLayout>
            <TextField source="title" />
            <TextField source="body" />
            <TextField source="author" />
          </SimpleShowLayout>
        </Show>
      </CoreAdminContext>
    </TestMemoryRouter>
  ),
};

export const LoadingState: Story = {
  name: "Loading State",
  render: () => (
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={{
          ...mockDataProvider,
          // Never resolves — keeps the component in its loading state
          getOne: () => new Promise(() => {}),
        }}
      >
        <Show resource="posts" id={999}>
          <SimpleShowLayout>
            <TextField source="title" />
          </SimpleShowLayout>
        </Show>
      </CoreAdminContext>
    </TestMemoryRouter>
  ),
};
