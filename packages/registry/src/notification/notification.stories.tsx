import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { CoreAdminContext, useNotify } from "ra-core";
import { MemoryRouter } from "react-router-dom";
import React, { useEffect } from "react";
import { Notification } from "./notification";

// Minimal data provider so CoreAdminContext (and the NotificationContext it
// provides) is available in every story.
const noop = () => Promise.resolve({ data: [] as never });
const dataProvider = {
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getOne: () => Promise.resolve({ data: { id: 1 } as never }),
  getMany: noop,
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  create: () => Promise.resolve({ data: { id: 2 } as never }),
  update: () => Promise.resolve({ data: { id: 1 } as never }),
  updateMany: noop,
  delete: () => Promise.resolve({ data: { id: 1 } as never }),
  deleteMany: noop,
};

function StoryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <CoreAdminContext dataProvider={dataProvider}>{children}</CoreAdminContext>
    </MemoryRouter>
  );
}

/**
 * Fires a notification via useNotify() when the button is clicked.
 */
function TriggerButton({
  message,
  type,
  label,
  onNotify,
}: {
  message: string;
  type: "success" | "error" | "info" | "warning";
  label: string;
  onNotify?: () => void;
}) {
  const notify = useNotify();
  return (
    <button
      type="button"
      onClick={() => {
        notify(message, { type });
        onNotify?.();
      }}
      className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Notification",
  decorators: [
    (Story) => (
      <StoryWrapper>
        <Story />
      </StoryWrapper>
    ),
  ],
};

export default meta;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const AllTypes: StoryObj = {
  name: "All variants",
  render: () => (
    <div className="flex gap-3">
      <TriggerButton message="Record saved successfully" type="success" label="Success toast" />
      <TriggerButton message="An error occurred while saving" type="error" label="Error toast" />
      <TriggerButton message="Record updated" type="info" label="Info toast" />
      <TriggerButton message="Unsaved changes may be lost" type="warning" label="Warning toast" />
      <Notification />
    </div>
  ),
};

export const Success: StoryObj<{ onNotify: () => void }> = {
  name: "Success notification",
  args: { onNotify: fn().mockName("onNotify") },
  render: ({ onNotify }) => (
    <div>
      <TriggerButton
        message="Post created successfully"
        type="success"
        label="Trigger success"
        onNotify={onNotify}
      />
      <Notification />
    </div>
  ),
};

export const Error: StoryObj<{ onNotify: () => void }> = {
  name: "Error notification",
  args: { onNotify: fn().mockName("onNotify") },
  render: ({ onNotify }) => (
    <div>
      <TriggerButton
        message="Failed to delete record"
        type="error"
        label="Trigger error"
        onNotify={onNotify}
      />
      <Notification />
    </div>
  ),
};

export const Info: StoryObj = {
  name: "Info notification",
  render: () => (
    <div>
      <TriggerButton message="3 items selected" type="info" label="Trigger info" />
      <Notification />
    </div>
  ),
};

export const Warning: StoryObj = {
  name: "Warning notification",
  render: () => (
    <div>
      <TriggerButton message="You have unsaved changes" type="warning" label="Trigger warning" />
      <Notification />
    </div>
  ),
};

/**
 * Shows a notification on mount to demonstrate what the toast looks like
 * immediately without requiring a button click.
 */
function AutoNotify({
  message,
  type,
}: {
  message: string;
  type: "success" | "error" | "info" | "warning";
}) {
  const notify = useNotify();
  useEffect(() => {
    notify(message, { type });
  }, [message, notify, type]);
  return null;
}

export const VisibleOnMount: StoryObj = {
  name: "Visible on mount (success)",
  render: () => (
    <>
      <AutoNotify message="Welcome back!" type="success" />
      <Notification />
    </>
  ),
};

export const MultipleToasts: StoryObj = {
  name: "Multiple toasts stacked",
  render: () => (
    <>
      <AutoNotify message="Record saved" type="success" />
      <AutoNotify message="Email notification sent" type="info" />
      <Notification />
    </>
  ),
};
