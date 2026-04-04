import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { ResourceContextProvider, RecordContextProvider, CoreAdminContext } from "ra-core";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { EditButton } from "./edit-button";
import { DeleteButton } from "./delete-button";
import { CreateButton } from "./create-button";
import React, { useEffect } from "react";

const record = { id: 1, title: "Hello World" };

/**
 * Spy on React Router navigation: renders a child route that logs the
 * current location to a Storybook action whenever it changes.
 */
function NavigationSpy({ onNavigate }: { onNavigate: (path: string) => void }) {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== "/") {
      onNavigate(location.pathname);
    }
  }, [location.pathname, onNavigate]);
  return null;
}

/**
 * Builds a minimal ra-core data provider where `delete` is replaced by a spy.
 * All other methods resolve immediately so the context boots without errors.
 */
function makeMockDataProvider(onDelete: (resource: string, params: { id: unknown }) => void) {
  const noop = () => Promise.resolve({ data: [] as never });
  return {
    getList: () => Promise.resolve({ data: [], total: 0 }),
    getOne: () => Promise.resolve({ data: { id: 1 } as never }),
    getMany: noop,
    getManyReference: () => Promise.resolve({ data: [], total: 0 }),
    create: () => Promise.resolve({ data: { id: 2 } as never }),
    update: () => Promise.resolve({ data: { id: 1 } as never }),
    updateMany: noop,
    delete: (_resource: string, params: { id: unknown }) => {
      onDelete(_resource, params);
      return Promise.resolve({ data: { id: params.id } as never });
    },
    deleteMany: noop,
  };
}

interface WrapperProps {
  children: React.ReactNode;
  onNavigate: (path: string) => void;
  onDelete: (resource: string, params: { id: unknown }) => void;
}

const Wrapper = ({ children, onNavigate, onDelete }: WrapperProps) => (
  <MemoryRouter initialEntries={["/"]}>
    <CoreAdminContext dataProvider={makeMockDataProvider(onDelete)}>
      <ResourceContextProvider value="posts">
        <RecordContextProvider value={record}>
          <NavigationSpy onNavigate={onNavigate} />
          <Routes>
            <Route
              path="*"
              element={<div className="flex items-center gap-2 p-4">{children}</div>}
            />
          </Routes>
        </RecordContextProvider>
      </ResourceContextProvider>
    </CoreAdminContext>
  </MemoryRouter>
);

// --- Shared spy args type ---

interface SpyArgs {
  onNavigate: (path: string) => void;
  onDelete: (resource: string, params: { id: unknown }) => void;
}

const defaultSpyArgs: SpyArgs = {
  onNavigate: fn().mockName("navigate"),
  onDelete: fn().mockName("delete"),
};

// --- EditButton ---

const editMeta: Meta<SpyArgs & { label?: string; resource?: string; className?: string }> = {
  title: "Button/EditButton",
  component: EditButton,
  args: defaultSpyArgs,
  decorators: [
    (Story, ctx) => (
      <Wrapper onNavigate={ctx.args.onNavigate} onDelete={ctx.args.onDelete}>
        <Story />
      </Wrapper>
    ),
  ],
};

export default editMeta;
type EditStory = StoryObj<typeof editMeta>;

export const DefaultEdit: EditStory = {
  name: "Default",
};

export const CustomLabel: EditStory = {
  name: "Custom Label",
  args: { label: "Edit Post" },
};

// --- DeleteButton ---

export const DefaultDelete: StoryObj<SpyArgs> = {
  name: "DeleteButton",
  args: defaultSpyArgs,
  render: (args) => (
    <Wrapper onNavigate={args.onNavigate} onDelete={args.onDelete}>
      <DeleteButton />
    </Wrapper>
  ),
};

// --- CreateButton ---

export const DefaultCreate: StoryObj<SpyArgs> = {
  name: "CreateButton",
  args: defaultSpyArgs,
  render: (args) => (
    <Wrapper onNavigate={args.onNavigate} onDelete={args.onDelete}>
      <CreateButton />
    </Wrapper>
  ),
};

export const AllButtons: StoryObj<SpyArgs> = {
  name: "All Buttons Together",
  args: defaultSpyArgs,
  render: (args) => (
    <Wrapper onNavigate={args.onNavigate} onDelete={args.onDelete}>
      <CreateButton />
      <EditButton />
      <DeleteButton />
    </Wrapper>
  ),
};
