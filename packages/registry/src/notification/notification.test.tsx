import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { cleanup } from "@testing-library/react";
import { CoreAdminContext, useNotify } from "ra-core";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import { Notification } from "./notification";

afterEach(cleanup);

// Minimal data provider required by CoreAdminContext
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

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <CoreAdminContext dataProvider={dataProvider}>{children}</CoreAdminContext>
    </MemoryRouter>
  );
}

/**
 * Helper component that triggers a notification via useNotify() when rendered.
 */
function NotifyTrigger({
  message,
  type = "info",
}: {
  message: string;
  type?: "success" | "error" | "info" | "warning";
}) {
  const notify = useNotify();
  React.useEffect(() => {
    notify(message, { type });
  }, [message, notify, type]);
  return null;
}

describe("Notification", () => {
  it("renders nothing when there are no notifications", () => {
    const { container } = render(
      <Wrapper>
        <Notification />
      </Wrapper>,
    );
    // The notification container itself should not be present
    expect(container.querySelector('[aria-label="Notifications"]')).toBeNull();
  });

  it("renders a toast when a notification is triggered", async () => {
    render(
      <Wrapper>
        <NotifyTrigger message="Record saved" type="success" />
        <Notification />
      </Wrapper>,
    );
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Record saved")).toBeInTheDocument();
  });

  it("renders an error toast", async () => {
    render(
      <Wrapper>
        <NotifyTrigger message="Something went wrong" type="error" />
        <Notification />
      </Wrapper>,
    );
    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders an info toast", async () => {
    render(
      <Wrapper>
        <NotifyTrigger message="Item updated" type="info" />
        <Notification />
      </Wrapper>,
    );
    expect(await screen.findByText("Item updated")).toBeInTheDocument();
  });

  it("renders a warning toast", async () => {
    render(
      <Wrapper>
        <NotifyTrigger message="Check your input" type="warning" />
        <Notification />
      </Wrapper>,
    );
    expect(await screen.findByText("Check your input")).toBeInTheDocument();
  });

  it("dismisses a toast when the dismiss button is clicked", async () => {
    render(
      <Wrapper>
        <NotifyTrigger message="Dismiss me" type="info" />
        <Notification />
      </Wrapper>,
    );
    // Wait for toast to appear
    await screen.findByText("Dismiss me");

    // Click the dismiss button
    const dismissBtn = screen.getByRole("button", {
      name: "Dismiss notification",
    });
    act(() => {
      fireEvent.click(dismissBtn);
    });

    expect(screen.queryByText("Dismiss me")).toBeNull();
  });

  it("auto-dismisses a toast after the given duration", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(
      <Wrapper>
        <NotifyTrigger message="Auto dismiss" type="info" />
        <Notification />
      </Wrapper>,
    );
    // Toast should appear (advance enough time for React to flush effects)
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByText("Auto dismiss")).toBeInTheDocument();

    // Advance timers past the default 4000 ms auto-hide duration
    act(() => {
      vi.advanceTimersByTime(4500);
    });
    expect(screen.queryByText("Auto dismiss")).toBeNull();
    vi.useRealTimers();
  });
});
