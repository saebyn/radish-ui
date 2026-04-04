import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecordContextProvider } from "ra-core";
import { TextField } from "./text-field";

function withRecord(record: Record<string, unknown>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <RecordContextProvider value={record}>{children}</RecordContextProvider>;
  };
}

describe("TextField", () => {
  it("renders the value from the record context", () => {
    render(<TextField source="title" />, {
      wrapper: withRecord({ id: 1, title: "Hello World" }),
    });
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders a dash when the field value is null", () => {
    render(<TextField source="title" />, {
      wrapper: withRecord({ id: 1, title: null }),
    });
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders a dash when the field value is undefined", () => {
    render(<TextField source="missing" />, {
      wrapper: withRecord({ id: 1 }),
    });
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("resolves nested dot-notation source paths", () => {
    render(<TextField source="author.name" />, {
      wrapper: withRecord({ id: 1, author: { name: "Alice" } }),
    });
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("converts non-string values to strings", () => {
    render(<TextField source="count" />, {
      wrapper: withRecord({ id: 1, count: 42 }),
    });
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("applies a custom className", () => {
    const { container } = render(<TextField source="title" className="custom-class" />, {
      wrapper: withRecord({ id: 1, title: "Test" }),
    });
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });
});
