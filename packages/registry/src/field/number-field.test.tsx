import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecordContextProvider } from "ra-core";
import { NumberField } from "./number-field";

function withRecord(record: Record<string, unknown>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <RecordContextProvider value={record}>{children}</RecordContextProvider>;
  };
}

describe("NumberField", () => {
  it("renders a formatted number", () => {
    render(<NumberField source="views" />, {
      wrapper: withRecord({ id: 1, views: 1000 }),
    });
    // Formatted by Intl.NumberFormat — at minimum contains "1" and "000"
    const el = screen.getByText(/1[,.]?000/);
    expect(el).toBeInTheDocument();
  });

  it("renders a dash when the value is null", () => {
    render(<NumberField source="price" />, {
      wrapper: withRecord({ id: 1, price: null }),
    });
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders a dash when the value is undefined", () => {
    render(<NumberField source="missing" />, {
      wrapper: withRecord({ id: 1 }),
    });
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders the raw string for non-numeric values", () => {
    render(<NumberField source="code" />, {
      wrapper: withRecord({ id: 1, code: "NaN-value" }),
    });
    expect(screen.getByText("NaN-value")).toBeInTheDocument();
  });

  it("formats currency with provided options", () => {
    render(
      <NumberField
        source="price"
        locales="en-US"
        options={{ style: "currency", currency: "USD" }}
      />,
      { wrapper: withRecord({ id: 1, price: 9.99 }) },
    );
    expect(screen.getByText("$9.99")).toBeInTheDocument();
  });

  it("applies a custom className", () => {
    const { container } = render(<NumberField source="views" className="my-class" />, {
      wrapper: withRecord({ id: 1, views: 5 }),
    });
    expect(container.querySelector(".my-class")).toBeInTheDocument();
  });
});
