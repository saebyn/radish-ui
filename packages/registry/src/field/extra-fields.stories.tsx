import type { Meta, StoryObj } from "@storybook/react";
import { RecordContextProvider } from "ra-core";
import { UrlField } from "./url-field";
import { EmailField } from "./email-field";
import { ChipField } from "./chip-field";
import { ArrayField } from "./array-field";

const record = {
  id: 1,
  website: "https://example.com",
  email: "alice@example.com",
  status: "active",
  tags: [
    { id: 1, name: "React" },
    { id: 2, name: "TypeScript" },
    { id: 3, name: "Tailwind" },
  ],
};

const meta: Meta = {
  title: "Field/Extra Fields",
  decorators: [
    (Story) => (
      <RecordContextProvider value={record}>
        <div className="p-4">
          <Story />
        </div>
      </RecordContextProvider>
    ),
  ],
  parameters: { layout: "padded" },
};

export default meta;

// ─── UrlField ────────────────────────────────────────────────────────────────

export const DefaultUrl: StoryObj = {
  name: "UrlField – default",
  render: () => <UrlField source="website" />,
};

export const UrlFieldTruncated: StoryObj = {
  name: "UrlField – truncated",
  render: () => <UrlField source="website" maxLength={15} />,
};

export const UrlFieldMissing: StoryObj = {
  name: "UrlField – missing value",
  render: () => <UrlField source="nonexistent" />,
};

// ─── EmailField ──────────────────────────────────────────────────────────────

export const DefaultEmail: StoryObj = {
  name: "EmailField – default",
  render: () => <EmailField source="email" />,
};

export const EmailFieldMissing: StoryObj = {
  name: "EmailField – missing value",
  render: () => <EmailField source="nonexistent" />,
};

// ─── ChipField ───────────────────────────────────────────────────────────────

export const ChipGray: StoryObj = {
  name: "ChipField – gray",
  render: () => <ChipField source="status" />,
};

export const ChipGreen: StoryObj = {
  name: "ChipField – green",
  render: () => <ChipField source="status" color="green" />,
};

export const ChipRed: StoryObj = {
  name: "ChipField – red",
  render: () => <ChipField source="status" color="red" />,
};

// ─── ArrayField ──────────────────────────────────────────────────────────────

export const DefaultArray: StoryObj = {
  name: "ArrayField with ChipField",
  render: () => (
    <ArrayField source="tags">
      <ChipField source="name" color="indigo" />
    </ArrayField>
  ),
};

export const ArrayFieldEmpty: StoryObj = {
  name: "ArrayField – empty",
  render: () => (
    <RecordContextProvider value={{ id: 2, tags: [] }}>
      <ArrayField source="tags">
        <ChipField source="name" />
      </ArrayField>
    </RecordContextProvider>
  ),
};
