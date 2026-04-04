import type { Meta, StoryObj } from "@storybook/react";
import { CoreAdminContext, TestMemoryRouter } from "ra-core";
import React from "react";
import { Edit } from "./edit";
import { SimpleForm } from "../form/simple-form";
import { TextInput } from "../form/text-input";
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

const meta: Meta<typeof Edit> = {
  title: "Detail/Edit",
  component: Edit,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  name: "Basic Edit",
  render: () => (
    <TestMemoryRouter>
      <CoreAdminContext dataProvider={mockDataProvider}>
        <Edit resource="posts" id={1}>
          <SimpleForm>
            <TextInput source="title" label="Title" />
            <TextInput source="body" label="Body" multiline rows={4} />
            <TextInput source="author" label="Author" />
          </SimpleForm>
        </Edit>
      </CoreAdminContext>
    </TestMemoryRouter>
  ),
};

export const WithActions: Story = {
  name: "With Actions",
  render: () => (
    <TestMemoryRouter>
      <CoreAdminContext dataProvider={mockDataProvider}>
        <Edit resource="posts" id={1} actions={<EditButton />}>
          <SimpleForm>
            <TextInput source="title" label="Title" />
            <TextInput source="body" label="Body" multiline />
            <TextInput source="author" label="Author" />
          </SimpleForm>
        </Edit>
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
        <Edit resource="posts" id={999}>
          <SimpleForm>
            <TextInput source="title" label="Title" />
            <TextInput source="body" label="Body" multiline />
            <TextInput source="author" label="Author" />
          </SimpleForm>
        </Edit>
      </CoreAdminContext>
    </TestMemoryRouter>
  ),
};

export const LoadingWithActions: Story = {
  name: "Loading State with Actions",
  render: () => (
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={{
          ...mockDataProvider,
          getOne: () => new Promise(() => {}),
        }}
      >
        <Edit resource="posts" id={999} actions={<EditButton />}>
          <SimpleForm>
            <TextInput source="title" label="Title" />
            <TextInput source="body" label="Body" multiline />
          </SimpleForm>
        </Edit>
      </CoreAdminContext>
    </TestMemoryRouter>
  ),
};

export const ErrorState: Story = {
  name: "Error State",
  render: () => (
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={{
          ...mockDataProvider,
          getOne: () => Promise.reject(new Error("Record not found")),
        }}
      >
        <Edit resource="posts" id={999}>
          <SimpleForm>
            <TextInput source="title" label="Title" />
          </SimpleForm>
        </Edit>
      </CoreAdminContext>
    </TestMemoryRouter>
  ),
};
