import type { Meta, StoryObj } from "@storybook/react";
import { RecordContextProvider } from "ra-core";
import React from "react";
import { BooleanField } from "./boolean-field";

const record = {
  id: 1,
  is_published: true,
  is_active: false,
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecordContextProvider value={record}>
    <div className="p-4 space-y-3">{children}</div>
  </RecordContextProvider>
);

const meta: Meta<typeof BooleanField> = {
  title: "Field/BooleanField",
  component: BooleanField,
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BooleanField>;

export const TrueValue: Story = {
  name: "True value",
  args: { source: "is_published" },
};

export const FalseValue: Story = {
  name: "False value",
  args: { source: "is_active" },
};
