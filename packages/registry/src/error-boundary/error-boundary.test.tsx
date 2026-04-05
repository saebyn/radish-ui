import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ErrorBoundary } from "./error-boundary";
/** A component that throws unconditionally, used to trigger the boundary. */
function Bomb({ message = "test error" }: { message?: string }) {
  throw new Error(message);
}

/** A component that only throws when `explode` is true. */
function ConditionalBomb({
  explode,
  message = "conditional error",
}: {
  explode: boolean;
  message?: string;
}) {
  if (explode) {
    throw new Error(message);
  }
  return <p>All good</p>;
}

// Silence the expected React error-boundary console output in test output.
const consoleError = console.error.bind(console);
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = consoleError;
});

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <p>Hello world</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders the default fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("test error")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("shows the error message in the default fallback", () => {
    render(
      <ErrorBoundary>
        <Bomb message="Widget exploded" />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Widget exploded")).toBeInTheDocument();
  });

  it("resets error state when 'Try again' is clicked (children render again)", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalBomb explode={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Re-render with a healthy child so that after reset the tree recovers.
    rerender(
      <ErrorBoundary>
        <ConditionalBomb explode={false} />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("renders a custom fallback when the fallback prop is provided", () => {
    const fallback = vi.fn((error: Error, reset: () => void) => (
      <div>
        <p>Custom: {error.message}</p>
        <button type="button" onClick={reset}>
          Custom reset
        </button>
      </div>
    ));

    render(
      <ErrorBoundary fallback={fallback}>
        <Bomb message="custom fallback error" />
      </ErrorBoundary>,
    );

    expect(fallback).toHaveBeenCalled();
    expect(screen.getByText("Custom: custom fallback error")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Custom reset" })).toBeInTheDocument();
  });

  it("passes a working reset callback to the custom fallback", () => {
    const { rerender } = render(
      <ErrorBoundary
        fallback={(error, reset) => (
          <button type="button" onClick={reset}>
            Reset: {error.message}
          </button>
        )}
      >
        <ConditionalBomb explode={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("button", { name: /Reset:/ })).toBeInTheDocument();

    rerender(
      <ErrorBoundary
        fallback={(error, reset) => (
          <button type="button" onClick={reset}>
            Reset: {error.message}
          </button>
        )}
      >
        <ConditionalBomb explode={false} />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Reset:/ }));

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("forwards className to the default fallback panel", () => {
    render(
      <ErrorBoundary className="my-custom-class">
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveClass("my-custom-class");
  });
});
