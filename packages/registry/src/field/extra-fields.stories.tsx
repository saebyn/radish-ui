import type { Meta, StoryObj } from "@storybook/react";
import { RecordContextProvider } from "ra-core";
import React from "react";
import { BooleanField } from "./boolean-field";
import { NumberField } from "./number-field";
import { DateField } from "./date-field";

const record = {
  id: 1,
  is_published: true,
  is_active: false,
  price: 1234.56,
  views: 98765,
  created_at: "2024-03-15T10:30:00Z",
  scheduled_at: null,
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecordContextProvider value={record}>
    <div className="p-4 space-y-3">{children}</div>
  </RecordContextProvider>
);

// ---- BooleanField ----

const booleanMeta: Meta<typeof BooleanField> = {
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

export default booleanMeta;
type BooleanStory = StoryObj<typeof BooleanField>;

export const TrueValue: BooleanStory = {
  name: "True value",
  args: { source: "is_published" },
};

export const FalseValue: BooleanStory = {
  name: "False value",
  args: { source: "is_active" },
};

// ---- NumberField ----

export const NumberDefault: StoryObj<typeof NumberField> = {
  name: "NumberField — default",
  render: () => (
    <Wrapper>
      <NumberField source="price" />
    </Wrapper>
  ),
};

export const NumberCurrency: StoryObj<typeof NumberField> = {
  name: "NumberField — currency",
  render: () => (
    <Wrapper>
      <NumberField source="price" options={{ style: "currency", currency: "USD" }} />
    </Wrapper>
  ),
};

export const NumberCompact: StoryObj<typeof NumberField> = {
  name: "NumberField — compact",
  render: () => (
    <Wrapper>
      <NumberField source="views" options={{ notation: "compact" }} />
    </Wrapper>
  ),
};

// ---- DateField ----

export const DateDefault: StoryObj<typeof DateField> = {
  name: "DateField — date only",
  render: () => (
    <Wrapper>
      <DateField source="created_at" />
    </Wrapper>
  ),
};

export const DateWithTime: StoryObj<typeof DateField> = {
  name: "DateField — with time",
  render: () => (
    <Wrapper>
      <DateField source="created_at" showTime />
    </Wrapper>
  ),
};

export const DateNull: StoryObj<typeof DateField> = {
  name: "DateField — null value",
  render: () => (
    <Wrapper>
      <DateField source="scheduled_at" />
    </Wrapper>
  ),
};
