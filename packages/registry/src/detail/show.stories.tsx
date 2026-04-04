import type { Meta, StoryObj } from "@storybook/react";
import { CoreAdminContext, ResourceContextProvider, ShowBase } from "ra-core";
import React from "react";
import { Show } from "./show";
import { SimpleShowLayout } from "./simple-show-layout";
import { TextField } from "../field/text-field";
import { EditButton } from "../button/edit-button";

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
    <CoreAdminContext>
      <ShowBase resource="posts" id={1}>
        <Show>
          <SimpleShowLayout>
            <TextField source="title" />
            <TextField source="body" />
            <TextField source="author" />
          </SimpleShowLayout>
        </Show>
      </ShowBase>
    </CoreAdminContext>
  ),
};

export const WithActions: Story = {
  name: "With Actions",
  render: () => (
    <CoreAdminContext>
      <ShowBase resource="posts" id={1}>
        <Show actions={<EditButton />}>
          <SimpleShowLayout>
            <TextField source="title" />
            <TextField source="body" />
            <TextField source="author" />
          </SimpleShowLayout>
        </Show>
      </ShowBase>
    </CoreAdminContext>
  ),
};

export const LoadingState: Story = {
  name: "Loading State",
  render: () => (
    <CoreAdminContext>
      <ResourceContextProvider value="posts">
        {/* ShowBase with an invalid id triggers loading state */}
        <ShowBase id={999} resource="posts">
          <Show>
            <SimpleShowLayout>
              <TextField source="title" />
            </SimpleShowLayout>
          </Show>
        </ShowBase>
      </ResourceContextProvider>
    </CoreAdminContext>
  ),
};
