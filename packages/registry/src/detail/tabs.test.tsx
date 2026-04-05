import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecordContextProvider, CreateBase, CoreAdminContext } from "ra-core";
import { MemoryRouter } from "react-router-dom";
import { TabbedShowLayout, TabPanel } from "./tabbed-show-layout";
import { TabbedForm, FormTab } from "./tabbed-form";
import { TextField } from "../field/text-field";
import { TextInput } from "../form/text-input";

const noop = () => Promise.resolve({ data: [] as never });
const mockDataProvider = {
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getOne: () => Promise.resolve({ data: { id: 1 } as never }),
  getMany: noop,
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  create: () => Promise.resolve({ data: { id: 2 } as never }),
  update: () => Promise.resolve({ data: { id: 1 } as never }),
  updateMany: noop,
  delete: noop,
  deleteMany: noop,
};

describe("TabbedShowLayout", () => {
  it("renders tab buttons for each TabPanel", () => {
    render(
      <RecordContextProvider value={{ id: 1, title: "Hello", body: "Content" }}>
        <TabbedShowLayout>
          <TabPanel label="Details">
            <TextField source="title" />
          </TabPanel>
          <TabPanel label="Content">
            <TextField source="body" />
          </TabPanel>
        </TabbedShowLayout>
      </RecordContextProvider>,
    );
    expect(screen.getByRole("tab", { name: "Details" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Content" })).toBeInTheDocument();
  });

  it("shows the first tab content by default", () => {
    render(
      <RecordContextProvider value={{ id: 1, title: "Hello", body: "Content" }}>
        <TabbedShowLayout>
          <TabPanel label="Details">
            <TextField source="title" />
          </TabPanel>
          <TabPanel label="Content">
            <TextField source="body" />
          </TabPanel>
        </TabbedShowLayout>
      </RecordContextProvider>,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("switches content when a different tab is clicked", () => {
    render(
      <RecordContextProvider value={{ id: 1, title: "Hello", body: "The body" }}>
        <TabbedShowLayout>
          <TabPanel label="Details">
            <TextField source="title" />
          </TabPanel>
          <TabPanel label="Content">
            <TextField source="body" />
          </TabPanel>
        </TabbedShowLayout>
      </RecordContextProvider>,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Content" }));
    // The Content tab panel should now be visible (not hidden)
    expect(screen.getByRole("tabpanel", { name: "Content" })).not.toHaveAttribute("hidden");
  });

  it("marks the active tab with aria-selected=true", () => {
    render(
      <RecordContextProvider value={{ id: 1, title: "Hello" }}>
        <TabbedShowLayout>
          <TabPanel label="Details">
            <TextField source="title" />
          </TabPanel>
          <TabPanel label="Other">
            <TextField source="title" />
          </TabPanel>
        </TabbedShowLayout>
      </RecordContextProvider>,
    );
    expect(screen.getByRole("tab", { name: "Details" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Other" })).toHaveAttribute("aria-selected", "false");
  });

  it("switches tabs with ArrowRight and ArrowLeft keyboard navigation", () => {
    render(
      <RecordContextProvider value={{ id: 1, title: "Hello", body: "The body" }}>
        <TabbedShowLayout>
          <TabPanel label="Details">
            <TextField source="title" />
          </TabPanel>
          <TabPanel label="Content">
            <TextField source="body" />
          </TabPanel>
        </TabbedShowLayout>
      </RecordContextProvider>,
    );

    const tablist = screen.getByRole("tablist");

    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Content" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Content" })).not.toHaveAttribute("hidden");

    fireEvent.keyDown(tablist, { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: "Details" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Details" })).not.toHaveAttribute("hidden");
  });

  it("switches tabs with Home and End keyboard navigation", () => {
    render(
      <RecordContextProvider
        value={{ id: 1, title: "Hello", body: "The body", summary: "Short summary" }}
      >
        <TabbedShowLayout>
          <TabPanel label="Details">
            <TextField source="title" />
          </TabPanel>
          <TabPanel label="Content">
            <TextField source="body" />
          </TabPanel>
          <TabPanel label="Summary">
            <TextField source="summary" />
          </TabPanel>
        </TabbedShowLayout>
      </RecordContextProvider>,
    );

    const tablist = screen.getByRole("tablist");

    fireEvent.keyDown(tablist, { key: "End" });
    expect(screen.getByRole("tab", { name: "Summary" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Summary" })).not.toHaveAttribute("hidden");

    fireEvent.keyDown(tablist, { key: "Home" });
    expect(screen.getByRole("tab", { name: "Details" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Details" })).not.toHaveAttribute("hidden");
  });
});

describe("TabbedForm", () => {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter>
        <CoreAdminContext dataProvider={mockDataProvider}>
          <CreateBase resource="posts">{children}</CreateBase>
        </CoreAdminContext>
      </MemoryRouter>
    );
  }

  it("renders tab buttons for each FormTab", () => {
    render(
      <TabbedForm>
        <FormTab label="Content">
          <TextInput source="title" />
        </FormTab>
        <FormTab label="Settings">
          <TextInput source="slug" />
        </FormTab>
      </TabbedForm>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole("tab", { name: "Content" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Settings" })).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    render(
      <TabbedForm>
        <FormTab label="Content">
          <TextInput source="title" />
        </FormTab>
      </TabbedForm>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("switches to the clicked tab", () => {
    render(
      <TabbedForm>
        <FormTab label="Content">
          <TextInput source="title" />
        </FormTab>
        <FormTab label="Settings">
          <TextInput source="slug" />
        </FormTab>
      </TabbedForm>,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole("tab", { name: "Settings" }));
    expect(screen.getByRole("tab", { name: "Settings" })).toHaveAttribute("aria-selected", "true");
  });

  it("switches tabs with ArrowRight and ArrowLeft keyboard navigation", () => {
    render(
      <TabbedForm>
        <FormTab label="Content">
          <TextInput source="title" />
        </FormTab>
        <FormTab label="Settings">
          <TextInput source="slug" />
        </FormTab>
      </TabbedForm>,
      { wrapper: Wrapper },
    );

    const tablist = screen.getByRole("tablist");

    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Settings" })).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(tablist, { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: "Content" })).toHaveAttribute("aria-selected", "true");
  });

  it("switches tabs with Home and End keyboard navigation", () => {
    render(
      <TabbedForm>
        <FormTab label="Content">
          <TextInput source="title" />
        </FormTab>
        <FormTab label="Settings">
          <TextInput source="slug" />
        </FormTab>
        <FormTab label="Metadata">
          <TextInput source="summary" />
        </FormTab>
      </TabbedForm>,
      { wrapper: Wrapper },
    );

    const tablist = screen.getByRole("tablist");

    fireEvent.keyDown(tablist, { key: "End" });
    expect(screen.getByRole("tab", { name: "Metadata" })).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(tablist, { key: "Home" });
    expect(screen.getByRole("tab", { name: "Content" })).toHaveAttribute("aria-selected", "true");
  });
});
