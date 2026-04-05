import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ErrorBoundary } from "./error-boundary";

const meta: Meta<typeof ErrorBoundary> = {
  title: "ErrorBoundary",
  component: ErrorBoundary,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

/** A component that throws on demand, used to trigger the error boundary. */
function BombButton({ label = "Trigger error" }: { label?: string }) {
  const [explode, setExplode] = useState(false);
  if (explode) {
    throw new Error("Oops! Something exploded.");
  }
  return (
    <button
      type="button"
      onClick={() => setExplode(true)}
      className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
    >
      {label}
    </button>
  );
}

export const Default: Story = {
  name: "Default fallback",
  render: () => (
    <div className="p-8">
      <p className="mb-4 text-sm text-gray-600">
        Click the button to throw a runtime error and see the default fallback UI.
      </p>
      <ErrorBoundary>
        <BombButton />
      </ErrorBoundary>
    </div>
  ),
};

export const CustomFallback: Story = {
  name: "Custom fallback",
  render: () => (
    <div className="p-8">
      <p className="mb-4 text-sm text-gray-600">
        This story uses the <code>fallback</code> prop to render a completely custom recovery UI.
      </p>
      <ErrorBoundary
        fallback={(error, reset) => (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
            <p className="font-semibold text-yellow-800">Custom error: {error.message}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-2 rounded bg-yellow-500 px-3 py-1 text-sm text-white hover:bg-yellow-600"
            >
              Retry
            </button>
          </div>
        )}
      >
        <BombButton label="Trigger custom error" />
      </ErrorBoundary>
    </div>
  ),
};

export const NormalOperation: Story = {
  name: "Normal operation (no error)",
  render: () => (
    <div className="p-8">
      <p className="mb-4 text-sm text-gray-600">
        When no error is thrown the children render normally.
      </p>
      <ErrorBoundary>
        <p className="text-green-700">✓ Everything is working fine.</p>
      </ErrorBoundary>
    </div>
  ),
};
