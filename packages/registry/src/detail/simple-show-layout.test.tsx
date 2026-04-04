import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecordContextProvider } from "ra-core";
import { SimpleShowLayout } from "./simple-show-layout";
import { TextField } from "../field/text-field";

function withRecord(record: Record<string, unknown>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <RecordContextProvider value={record}>{children}</RecordContextProvider>;
  };
}

describe("SimpleShowLayout", () => {
  it("renders a label derived from the child's source prop", () => {
    render(
      <SimpleShowLayout>
        <TextField source="title" />
      </SimpleShowLayout>,
      { wrapper: withRecord({ id: 1, title: "Hello" }) },
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("renders the child's explicit label when provided", () => {
    render(
      <SimpleShowLayout>
        <TextField source="name" label="Full Name" />
      </SimpleShowLayout>,
      { wrapper: withRecord({ id: 1, name: "Alice" }) },
    );
    expect(screen.getByText("Full Name")).toBeInTheDocument();
  });

  it("renders the field value alongside the label", () => {
    render(
      <SimpleShowLayout>
        <TextField source="title" />
      </SimpleShowLayout>,
      { wrapper: withRecord({ id: 1, title: "My Title" }) },
    );
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("renders multiple fields", () => {
    render(
      <SimpleShowLayout>
        <TextField source="title" label="Title" />
        <TextField source="author" label="Author" />
      </SimpleShowLayout>,
      { wrapper: withRecord({ id: 1, title: "Post", author: "Bob" }) },
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Author")).toBeInTheDocument();
    expect(screen.getByText("Post")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("falls back to 'Field N' label when source and label are absent", () => {
    render(
      <SimpleShowLayout>
        {/* @ts-expect-error intentional: testing fallback label */}
        <span>no source</span>
      </SimpleShowLayout>,
      { wrapper: withRecord({ id: 1 }) },
    );
    expect(screen.getByText("Field 1")).toBeInTheDocument();
  });
});
