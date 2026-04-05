import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Confirm } from "./confirm";

const meta: Meta<typeof Confirm> = {
  title: "Dialog/Confirm",
  component: Confirm,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof Confirm>;

function ConfirmDemo(
  props: Omit<React.ComponentProps<typeof Confirm>, "isOpen" | "onClose" | "onConfirm">,
) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
      >
        Open dialog
      </button>
      <Confirm
        {...props}
        isOpen={isOpen}
        onConfirm={() => setIsOpen(false)}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <ConfirmDemo title="Delete record?" content="This action cannot be undone." />,
};

export const CustomLabels: Story = {
  render: () => (
    <ConfirmDemo
      title="Publish post?"
      content="The post will be visible to all readers."
      confirmLabel="Yes, publish"
      cancelLabel="Not yet"
    />
  ),
};

export const NoContent: Story = {
  render: () => <ConfirmDemo title="Are you sure?" />,
};
