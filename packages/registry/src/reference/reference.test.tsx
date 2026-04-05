import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  RecordContextProvider,
  ResourceContextProvider,
  CoreAdminContext,
  CreateBase,
} from "ra-core";
import { MemoryRouter } from "react-router-dom";
import { ReferenceField } from "./reference-field";
import { ReferenceInput } from "./reference-input";
import { TextField } from "../field/text-field";
import { SimpleForm } from "../form/simple-form";

const authors = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

const noop = () => Promise.resolve({ data: [] as never });

const mockDataProvider = {
  getList: () => Promise.resolve({ data: authors, total: 2 }),
  getOne: (_resource: string, { id }: { id: unknown }) =>
    Promise.resolve({
      data: authors.find((a) => a.id === id) ?? { id, name: "Unknown" },
    } as never),
  getMany: (_resource: string, { ids }: { ids: unknown[] }) =>
    Promise.resolve({
      data: ids.map((id) => authors.find((a) => a.id === id)).filter(Boolean) as never,
    }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  create: () => Promise.resolve({ data: { id: 3 } as never }),
  update: () => Promise.resolve({ data: { id: 1 } as never }),
  updateMany: noop,
  delete: noop,
  deleteMany: noop,
};

function AdminWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <CoreAdminContext dataProvider={mockDataProvider}>
        <ResourceContextProvider value="posts">{children}</ResourceContextProvider>
      </CoreAdminContext>
    </MemoryRouter>
  );
}

describe("ReferenceField", () => {
  it("renders a dash when the foreign key is null", () => {
    render(
      <AdminWrapper>
        <RecordContextProvider value={{ id: 1, authorId: null }}>
          <ReferenceField source="authorId" reference="authors">
            <TextField source="name" />
          </ReferenceField>
        </RecordContextProvider>
      </AdminWrapper>,
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows a loading indicator while fetching", () => {
    render(
      <AdminWrapper>
        <RecordContextProvider value={{ id: 1, authorId: 999 }}>
          <ReferenceField source="authorId" reference="authors">
            <TextField source="name" />
          </ReferenceField>
        </RecordContextProvider>
      </AdminWrapper>,
    );
    // During the initial load, loading indicator is shown
    expect(screen.getByText("…")).toBeInTheDocument();
  });

  it("loading state has role='status'", () => {
    render(
      <AdminWrapper>
        <RecordContextProvider value={{ id: 1, authorId: 999 }}>
          <ReferenceField source="authorId" reference="authors">
            <TextField source="name" />
          </ReferenceField>
        </RecordContextProvider>
      </AdminWrapper>,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("ReferenceInput", () => {
  it("renders a select with a loading placeholder initially", () => {
    render(
      <AdminWrapper>
        <CreateBase resource="posts">
          <SimpleForm>
            <ReferenceInput source="authorId" reference="authors" />
          </SimpleForm>
        </CreateBase>
      </AdminWrapper>,
    );
    // Select element should be rendered
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
