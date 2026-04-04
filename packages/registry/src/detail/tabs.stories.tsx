import type { Meta, StoryObj } from "@storybook/react";
import { RecordContextProvider, CreateBase, CoreAdminContext } from "ra-core";
import { MemoryRouter } from "react-router-dom";
import { TabbedShowLayout, TabPanel } from "./tabbed-show-layout";
import { TabbedForm, FormTab } from "./tabbed-form";
import { TextField } from "../field/text-field";
import { TextInput } from "../form/text-input";
import { BooleanInput } from "../form/boolean-input";

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

const meta: Meta = {
  title: "Detail/Tabs",
  parameters: { layout: "padded" },
};

export default meta;

export const DefaultTabbedShowLayout: StoryObj = {
  name: "TabbedShowLayout",
  render: () => (
    <RecordContextProvider
      value={{
        id: 1,
        title: "Hello World",
        body: "Post content here.",
        status: "published",
      }}
    >
      <TabbedShowLayout>
        <TabPanel label="Details">
          <dl className="divide-y divide-gray-100 dark:divide-gray-700">
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Title</dt>
              <dd className="mt-1 sm:col-span-2 sm:mt-0">
                <TextField source="title" />
              </dd>
            </div>
          </dl>
        </TabPanel>
        <TabPanel label="Content">
          <dl className="divide-y divide-gray-100 dark:divide-gray-700">
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Body</dt>
              <dd className="mt-1 sm:col-span-2 sm:mt-0">
                <TextField source="body" />
              </dd>
            </div>
          </dl>
        </TabPanel>
        <TabPanel label="Settings">
          <dl className="divide-y divide-gray-100 dark:divide-gray-700">
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 sm:col-span-2 sm:mt-0">
                <TextField source="status" />
              </dd>
            </div>
          </dl>
        </TabPanel>
      </TabbedShowLayout>
    </RecordContextProvider>
  ),
};

export const DefaultTabbedForm: StoryObj = {
  name: "TabbedForm",
  render: () => (
    <MemoryRouter>
      <CoreAdminContext dataProvider={mockDataProvider}>
        <CreateBase resource="posts">
          <TabbedForm>
            <FormTab label="Content">
              <TextInput source="title" label="Title" />
              <TextInput source="body" label="Body" multiline />
            </FormTab>
            <FormTab label="Settings">
              <BooleanInput source="published" label="Published" />
            </FormTab>
          </TabbedForm>
        </CreateBase>
      </CoreAdminContext>
    </MemoryRouter>
  ),
};
