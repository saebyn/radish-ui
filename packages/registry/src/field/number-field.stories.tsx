import type { Meta, StoryObj } from "@storybook/react";
import { RecordContextProvider } from "ra-core";
import React from "react";
import { NumberField } from "./number-field";

const record = {
  id: 1,
  price: 1234.56,
  views: 98765,
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecordContextProvider value={record}>
    <div className="p-4 space-y-3">{children}</div>
  </RecordContextProvider>
);

const meta: Meta<typeof NumberField> = {
  title: "Field/NumberField",
  component: NumberField,
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NumberField>;

export const Default: Story = {
  name: "Default",
  args: { source: "price" },
};

export const Currency: Story = {
  name: "Currency",
  args: { source: "price", options: { style: "currency", currency: "USD" } },
};

export const Compact: Story = {
  name: "Compact",
  args: { source: "views", options: { notation: "compact" } },
};
