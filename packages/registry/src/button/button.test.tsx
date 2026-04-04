import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CoreAdminContext, ResourceContextProvider, RecordContextProvider } from "ra-core";
import { MemoryRouter } from "react-router-dom";
import { CreateButton } from "./create-button";
import { EditButton } from "./edit-button";
import { DeleteButton } from "./delete-button";

// Minimal data provider required by CoreAdminContext
const noop = () => Promise.resolve({ data: [] as never });

function makeDataProvider(deleteImpl?: () => void) {
  return {
    getList: () => Promise.resolve({ data: [], total: 0 }),
    getOne: () => Promise.resolve({ data: { id: 1 } as never }),
    getMany: noop,
    getManyReference: () => Promise.resolve({ data: [], total: 0 }),
    create: () => Promise.resolve({ data: { id: 2 } as never }),
    update: () => Promise.resolve({ data: { id: 1 } as never }),
    updateMany: noop,
    delete: () => {
      deleteImpl?.();
      return Promise.resolve({ data: { id: 1 } as never });
    },
    deleteMany: noop,
  };
}

function Wrapper({
  children,
  record = { id: 1, title: "Test" },
  deleteImpl,
}: {
  children: React.ReactNode;
  record?: Record<string, unknown>;
  deleteImpl?: () => void;
}) {
  return (
    <MemoryRouter>
      <CoreAdminContext dataProvider={makeDataProvider(deleteImpl)}>
        <ResourceContextProvider value="posts">
          <RecordContextProvider value={record}>{children}</RecordContextProvider>
        </ResourceContextProvider>
      </CoreAdminContext>
    </MemoryRouter>
  );
}

describe("CreateButton", () => {
  it("renders with default label", () => {
    render(
      <MemoryRouter>
        <CoreAdminContext dataProvider={makeDataProvider()}>
          <ResourceContextProvider value="posts">
            <CreateButton />
          </ResourceContextProvider>
        </CoreAdminContext>
      </MemoryRouter>,
    );
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("renders with a custom label", () => {
    render(
      <MemoryRouter>
        <CoreAdminContext dataProvider={makeDataProvider()}>
          <ResourceContextProvider value="posts">
            <CreateButton label="New Post" />
          </ResourceContextProvider>
        </CoreAdminContext>
      </MemoryRouter>,
    );
    expect(screen.getByText("New Post")).toBeInTheDocument();
  });

  it("renders an anchor link pointing to the create path", () => {
    render(
      <MemoryRouter>
        <CoreAdminContext dataProvider={makeDataProvider()}>
          <ResourceContextProvider value="posts">
            <CreateButton />
          </ResourceContextProvider>
        </CoreAdminContext>
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: "Create" });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toMatch(/posts\/create/);
  });
});

describe("EditButton", () => {
  it("renders with default label", () => {
    render(<EditButton />, { wrapper: Wrapper });
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders with a custom label", () => {
    render(<EditButton label="Modify" />, { wrapper: Wrapper });
    expect(screen.getByText("Modify")).toBeInTheDocument();
  });

  it("renders a link to the edit path of the current record", () => {
    render(<EditButton />, { wrapper: Wrapper });
    const link = screen.getByRole("link", { name: "Edit" });
    expect(link.getAttribute("href")).toMatch(/posts\/1\/edit|posts\/1/);
  });

  it("renders nothing when there is no record in context", () => {
    function NoRecordWrapper({ children }: { children: React.ReactNode }) {
      return (
        <MemoryRouter>
          <CoreAdminContext dataProvider={makeDataProvider()}>
            <ResourceContextProvider value="posts">{children}</ResourceContextProvider>
          </CoreAdminContext>
        </MemoryRouter>
      );
    }
    const { container } = render(<EditButton />, { wrapper: NoRecordWrapper });
    expect(container.firstChild).toBeNull();
  });
});

describe("DeleteButton", () => {
  beforeEach(() => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("renders with default label", () => {
    render(<DeleteButton />, { wrapper: Wrapper });
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("renders with a custom label", () => {
    render(<DeleteButton label="Remove" />, { wrapper: Wrapper });
    expect(screen.getByText("Remove")).toBeInTheDocument();
  });

  it("shows a confirm dialog when clicked", () => {
    render(<DeleteButton />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText("Delete"));
    expect(window.confirm).toHaveBeenCalled();
  });

  it("does not delete when the confirm dialog is cancelled", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const deleteImpl = vi.fn();
    render(<DeleteButton />, {
      wrapper: ({ children }) => <Wrapper deleteImpl={deleteImpl}>{children}</Wrapper>,
    });
    fireEvent.click(screen.getByText("Delete"));
    expect(deleteImpl).not.toHaveBeenCalled();
  });

  it("renders nothing when there is no record in context", () => {
    function NoRecordWrapper({ children }: { children: React.ReactNode }) {
      return (
        <MemoryRouter>
          <CoreAdminContext dataProvider={makeDataProvider()}>
            <ResourceContextProvider value="posts">{children}</ResourceContextProvider>
          </CoreAdminContext>
        </MemoryRouter>
      );
    }
    const { container } = render(<DeleteButton />, { wrapper: NoRecordWrapper });
    expect(container.firstChild).toBeNull();
  });
});
