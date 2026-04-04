import type { Meta, StoryObj } from "@storybook/react";
import { CoreAdminContext, CreateBase } from "ra-core";
import React from "react";
import { SimpleForm } from "./simple-form";
import { TextInput } from "./text-input";
import { NumberInput } from "./number-input";
import { SelectInput } from "./select-input";
import { BooleanInput } from "./boolean-input";

const defaultValues = {
  title: "Hello World",
  body: "A sample body.",
  price: 9.99,
  status: "published",
  is_featured: true,
};

/**
 * Wraps children in a CreateBase so that react-hook-form context (needed by
 * useInput) is always available. defaultValues pre-populates the fields so
 * stories look realistic without needing a real data provider.
 */
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <CoreAdminContext>
    <CreateBase resource="posts" record={defaultValues}>
      <div className="max-w-xl p-6">
        <SimpleForm>{children}</SimpleForm>
      </div>
    </CreateBase>
  </CoreAdminContext>
);

const meta: Meta<typeof SimpleForm> = {
  title: "Form/SimpleForm",
  component: SimpleForm,
};

export default meta;
type Story = StoryObj<typeof SimpleForm>;

export const AllInputTypes: Story = {
  name: "All Input Types",
  render: () => (
    <CoreAdminContext>
      <CreateBase resource="posts" record={defaultValues}>
        <div className="max-w-xl p-6">
          <SimpleForm submitLabel="Create Post">
            <TextInput source="title" label="Title" />
            <TextInput source="body" label="Body" multiline rows={4} />
            <NumberInput source="price" label="Price" min={0} step={0.01} />
            <SelectInput
              source="status"
              label="Status"
              choices={[
                { id: "draft", name: "Draft" },
                { id: "published", name: "Published" },
                { id: "archived", name: "Archived" },
              ]}
            />
            <BooleanInput source="is_featured" label="Featured?" />
          </SimpleForm>
        </div>
      </CreateBase>
    </CoreAdminContext>
  ),
};

export const TextInputStory: Story = {
  name: "TextInput",
  render: () => (
    <Wrapper>
      <TextInput source="title" label="Title" />
    </Wrapper>
  ),
};

export const TextInputMultiline: Story = {
  name: "TextInput (multiline)",
  render: () => (
    <Wrapper>
      <TextInput source="body" label="Body" multiline rows={5} />
    </Wrapper>
  ),
};

export const NumberInputStory: Story = {
  name: "NumberInput",
  render: () => (
    <Wrapper>
      <NumberInput source="price" label="Price" min={0} step={0.01} />
    </Wrapper>
  ),
};

export const SelectInputStory: Story = {
  name: "SelectInput",
  render: () => (
    <Wrapper>
      <SelectInput
        source="status"
        label="Status"
        choices={[
          { id: "draft", name: "Draft" },
          { id: "published", name: "Published" },
          { id: "archived", name: "Archived" },
        ]}
      />
    </Wrapper>
  ),
};

export const BooleanInputStory: Story = {
  name: "BooleanInput",
  render: () => (
    <Wrapper>
      <BooleanInput source="is_featured" label="Featured?" />
    </Wrapper>
  ),
};

export const InCreateContext: Story = {
  name: "In CreateBase context",
  render: () => (
    <CoreAdminContext>
      <CreateBase resource="posts">
        <SimpleForm submitLabel="Create Post">
          <TextInput source="title" label="Title" />
          <TextInput source="body" label="Body" multiline />
          <SelectInput
            source="status"
            label="Status"
            choices={[
              { id: "draft", name: "Draft" },
              { id: "published", name: "Published" },
            ]}
          />
          <BooleanInput source="is_featured" label="Featured?" />
        </SimpleForm>
      </CreateBase>
    </CoreAdminContext>
  ),
};
