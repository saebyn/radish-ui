import type { Meta, StoryObj } from "@storybook/react";
import { RecordContextProvider } from "ra-core";
import React from "react";
import { DateField } from "./date-field";

const record = {
  id: 1,
  created_at: "2024-03-15T10:30:00Z",
  scheduled_at: null,
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecordContextProvider value={record}>
    <div className="p-4 space-y-3">{children}</div>
  </RecordContextProvider>
);

const meta: Meta<typeof DateField> = {
  title: "Field/DateField",
  component: DateField,
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DateField>;

export const DateOnly: Story = {
  name: "Date only",
  args: { source: "created_at" },
};

export const WithTime: Story = {
  name: "With time",
  args: { source: "created_at", showTime: true },
};

export const NullValue: Story = {
  name: "Null value",
  args: { source: "scheduled_at" },
};
