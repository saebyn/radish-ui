import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecordContextProvider } from "ra-core";
import { BooleanField } from "./boolean-field";

function withRecord(record: Record<string, unknown>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <RecordContextProvider value={record}>{children}</RecordContextProvider>;
  };
}

describe("BooleanField", () => {
  it("renders truthy label and accessible name for boolean true", () => {
    render(<BooleanField source="active" />, {
      wrapper: withRecord({ id: 1, active: true }),
    });
    expect(screen.getByLabelText("Yes")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("renders falsy label and accessible name for boolean false", () => {
    render(<BooleanField source="active" />, {
      wrapper: withRecord({ id: 1, active: false }),
    });
    expect(screen.getByLabelText("No")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("treats numeric 1 as truthy", () => {
    render(<BooleanField source="active" />, {
      wrapper: withRecord({ id: 1, active: 1 }),
    });
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it('treats string "true" as truthy', () => {
    render(<BooleanField source="active" />, {
      wrapper: withRecord({ id: 1, active: "true" }),
    });
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it('treats string "1" as truthy', () => {
    render(<BooleanField source="active" />, {
      wrapper: withRecord({ id: 1, active: "1" }),
    });
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("treats null as falsy", () => {
    render(<BooleanField source="active" />, {
      wrapper: withRecord({ id: 1, active: null }),
    });
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("renders custom trueLabel and falseLabel", () => {
    render(<BooleanField source="published" trueLabel="Published" falseLabel="Draft" />, {
      wrapper: withRecord({ id: 1, published: true }),
    });
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("renders the falseLabel when value is false with custom labels", () => {
    render(<BooleanField source="published" trueLabel="Published" falseLabel="Draft" />, {
      wrapper: withRecord({ id: 1, published: false }),
    });
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });
});
