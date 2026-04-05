import type { Meta, StoryObj } from "@storybook/react";
import {
  RecordContextProvider,
  ResourceContextProvider,
  CoreAdminContext,
  CreateBase,
} from "ra-core";
import { MemoryRouter } from "react-router-dom";
import { ReferenceField } from "./reference-field";
import { ReferenceInput } from "./reference-input";
import { TextField } from "../field/text-field";
import { SimpleForm } from "../form/simple-form";

const authors = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

const noop = () => Promise.resolve({ data: [] as never });

const mockDataProvider = {
  getList: () => Promise.resolve({ data: authors, total: 2 }),
  getOne: (_resource: string, { id }: { id: unknown }) =>
    Promise.resolve({
      data: authors.find((a) => a.id === id) ?? { id, name: "Unknown" },
    } as never),
  getMany: (_resource: string, { ids }: { ids: unknown[] }) =>
    Promise.resolve({
      data: ids.map((id) => authors.find((a) => a.id === id)).filter(Boolean) as never,
    }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  create: () => Promise.resolve({ data: { id: 3, name: "New" } as never }),
  update: () => Promise.resolve({ data: { id: 1 } as never }),
  updateMany: noop,
  delete: noop,
  deleteMany: noop,
};

const meta: Meta = {
  title: "Reference/Reference Components",
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

export const DefaultReferenceField: StoryObj = {
  name: "ReferenceField – loads related record",
  render: () => (
    <RecordContextProvider value={{ id: 1, title: "My Post", authorId: 1 }}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500">Author:</span>
        <ReferenceField source="authorId" reference="authors">
          <TextField source="name" />
        </ReferenceField>
      </div>
    </RecordContextProvider>
  ),
};

export const ReferenceFieldMissing: StoryObj = {
  name: "ReferenceField – null foreign key",
  render: () => (
    <RecordContextProvider value={{ id: 1, title: "My Post", authorId: null }}>
      <ReferenceField source="authorId" reference="authors">
        <TextField source="name" />
      </ReferenceField>
    </RecordContextProvider>
  ),
};

export const DefaultReferenceInput: StoryObj = {
  name: "ReferenceInput – select from related resource",
  render: () => (
    <CreateBase resource="posts">
      <SimpleForm>
        <ReferenceInput source="authorId" reference="authors" />
      </SimpleForm>
    </CreateBase>
  ),
};
