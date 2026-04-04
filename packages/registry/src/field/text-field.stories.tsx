import type { Meta, StoryObj } from "@storybook/react";
import { RecordContextProvider } from "ra-core";
import { TextField } from "./text-field";

const meta: Meta<typeof TextField> = {
  title: "Field/TextField",
  component: TextField,
  decorators: [
    (Story) => (
      <RecordContextProvider value={{ id: 1, title: "Hello World", author: { name: "Alice" } }}>
        <div className="p-4">
          <Story />
        </div>
      </RecordContextProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {
    source: "title",
  },
};

export const NestedSource: Story = {
  args: {
    source: "author.name",
    label: "Author",
  },
};

export const MissingValue: Story = {
  args: {
    source: "nonexistent",
  },
};
