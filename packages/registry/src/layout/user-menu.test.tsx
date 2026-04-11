import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { CoreAdminContext } from "ra-core";
import { MemoryRouter } from "react-router-dom";
import { UserMenu, UserMenuItem } from "./user-menu";

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Minimal providers
// ---------------------------------------------------------------------------

const noop = () => Promise.resolve({ data: [] as never });
const dataProvider = {
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getOne: () => Promise.resolve({ data: { id: 1 } as never }),
  getMany: noop,
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  create: () => Promise.resolve({ data: { id: 2 } as never }),
  update: () => Promise.resolve({ data: { id: 1 } as never }),
  updateMany: noop,
  delete: () => Promise.resolve({ data: { id: 1 } as never }),
  deleteMany: noop,
};

const testI18nProvider = {
  translate: (key: string, options?: { _?: string; [k: string]: unknown }) =>
    typeof options?._ === "string" ? options._ : key,
  changeLocale: () => Promise.resolve(),
  getLocale: () => "en",
};

function makeAuthProvider(fullName?: string) {
  return {
    login: () => Promise.resolve(),
    logout: vi.fn().mockResolvedValue(undefined),
    checkAuth: () => Promise.resolve(),
    checkError: () => Promise.resolve(),
    getPermissions: () => Promise.resolve(),
    getIdentity: () =>
      Promise.resolve({
        id: 1,
        fullName: fullName ?? "Jane Smith",
      }),
  };
}

interface WrapperProps {
  children: React.ReactNode;
  authProvider?: ReturnType<typeof makeAuthProvider>;
}

function Wrapper({ children, authProvider }: WrapperProps) {
  return (
    <MemoryRouter>
      <CoreAdminContext
        dataProvider={dataProvider}
        i18nProvider={testI18nProvider}
        authProvider={authProvider}
      >
        {children}
      </CoreAdminContext>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("UserMenuItem", () => {
  it("renders children as label", () => {
    render(<UserMenuItem>My Profile</UserMenuItem>);
    expect(screen.getByRole("menuitem", { name: "My Profile" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handler = vi.fn();
    render(<UserMenuItem onClick={handler}>Click me</UserMenuItem>);
    fireEvent.click(screen.getByRole("menuitem"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("renders an icon when provided", () => {
    render(<UserMenuItem icon={<span data-testid="icon" />}>Item</UserMenuItem>);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});

describe("UserMenu – no auth provider", () => {
  it("renders the trigger button (anonymous, shows U initials)", async () => {
    render(
      <Wrapper>
        <UserMenu />
      </Wrapper>,
    );
    // Wait for identity query to settle
    await waitFor(() => expect(screen.queryByLabelText("User menu")).toBeInTheDocument());
    expect(screen.getByLabelText("User menu")).toBeInTheDocument();
  });

  it("shows 'U' initials when no identity is available", async () => {
    render(
      <Wrapper>
        <UserMenu />
      </Wrapper>,
    );
    await waitFor(() => screen.getByLabelText("User menu"));
    expect(screen.getByText("U")).toBeInTheDocument();
  });
});

describe("UserMenu – with auth provider", () => {
  let authProvider: ReturnType<typeof makeAuthProvider>;

  beforeEach(() => {
    authProvider = makeAuthProvider("Jane Smith");
  });

  it("renders a trigger button with the user's aria-label", async () => {
    render(
      <Wrapper authProvider={authProvider}>
        <UserMenu />
      </Wrapper>,
    );
    await waitFor(() =>
      expect(screen.queryByLabelText("User menu for Jane Smith")).toBeInTheDocument(),
    );
  });

  it("shows the user's initials", async () => {
    render(
      <Wrapper authProvider={authProvider}>
        <UserMenu />
      </Wrapper>,
    );
    await waitFor(() => screen.getByLabelText("User menu for Jane Smith"));
    expect(screen.getByText("JS")).toBeInTheDocument();
  });

  it("menu is closed by default", async () => {
    render(
      <Wrapper authProvider={authProvider}>
        <UserMenu />
      </Wrapper>,
    );
    await waitFor(() => screen.getByLabelText("User menu for Jane Smith"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens the dropdown when the trigger is clicked", async () => {
    render(
      <Wrapper authProvider={authProvider}>
        <UserMenu />
      </Wrapper>,
    );
    await waitFor(() => screen.getByLabelText("User menu for Jane Smith"));
    fireEvent.click(screen.getByLabelText("User menu for Jane Smith"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("shows the user's display name in the dropdown header", async () => {
    render(
      <Wrapper authProvider={authProvider}>
        <UserMenu />
      </Wrapper>,
    );
    await waitFor(() => screen.getByLabelText("User menu for Jane Smith"));
    fireEvent.click(screen.getByLabelText("User menu for Jane Smith"));
    // The name appears in both the trigger label and the dropdown header
    const nameElements = screen.getAllByText("Jane Smith");
    expect(nameElements.length).toBeGreaterThanOrEqual(1);
  });

  it("shows the logout button", async () => {
    render(
      <Wrapper authProvider={authProvider}>
        <UserMenu />
      </Wrapper>,
    );
    await waitFor(() => screen.getByLabelText("User menu for Jane Smith"));
    fireEvent.click(screen.getByLabelText("User menu for Jane Smith"));
    expect(screen.getByRole("menuitem", { name: /logout/i })).toBeInTheDocument();
  });

  it("uses a custom logoutLabel when provided", async () => {
    render(
      <Wrapper authProvider={authProvider}>
        <UserMenu logoutLabel="Sign out" />
      </Wrapper>,
    );
    await waitFor(() => screen.getByLabelText("User menu for Jane Smith"));
    fireEvent.click(screen.getByLabelText("User menu for Jane Smith"));
    expect(screen.getByRole("menuitem", { name: "Sign out" })).toBeInTheDocument();
  });

  it("calls authProvider.logout when the logout button is clicked", async () => {
    render(
      <Wrapper authProvider={authProvider}>
        <UserMenu />
      </Wrapper>,
    );
    await waitFor(() => screen.getByLabelText("User menu for Jane Smith"));
    fireEvent.click(screen.getByLabelText("User menu for Jane Smith"));
    fireEvent.click(screen.getByRole("menuitem", { name: /logout/i }));
    expect(authProvider.logout).toHaveBeenCalled();
  });

  it("closes the menu when logout is clicked", async () => {
    render(
      <Wrapper authProvider={authProvider}>
        <UserMenu />
      </Wrapper>,
    );
    await waitFor(() => screen.getByLabelText("User menu for Jane Smith"));
    fireEvent.click(screen.getByLabelText("User menu for Jane Smith"));
    fireEvent.click(screen.getByRole("menuitem", { name: /logout/i }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("renders custom children in the dropdown", async () => {
    render(
      <Wrapper authProvider={authProvider}>
        <UserMenu>
          <UserMenuItem>My Profile</UserMenuItem>
        </UserMenu>
      </Wrapper>,
    );
    await waitFor(() => screen.getByLabelText("User menu for Jane Smith"));
    fireEvent.click(screen.getByLabelText("User menu for Jane Smith"));
    expect(screen.getByRole("menuitem", { name: "My Profile" })).toBeInTheDocument();
  });

  it("closes the menu when Escape is pressed", async () => {
    render(
      <Wrapper authProvider={authProvider}>
        <UserMenu />
      </Wrapper>,
    );
    await waitFor(() => screen.getByLabelText("User menu for Jane Smith"));
    fireEvent.click(screen.getByLabelText("User menu for Jane Smith"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes the menu when clicking outside", async () => {
    render(
      <div>
        <Wrapper authProvider={authProvider}>
          <UserMenu />
        </Wrapper>
        <button>Outside</button>
      </div>,
    );
    await waitFor(() => screen.getByLabelText("User menu for Jane Smith"));
    fireEvent.click(screen.getByLabelText("User menu for Jane Smith"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByText("Outside"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("toggles aria-expanded on the trigger button", async () => {
    render(
      <Wrapper authProvider={authProvider}>
        <UserMenu />
      </Wrapper>,
    );
    await waitFor(() => screen.getByLabelText("User menu for Jane Smith"));
    const trigger = screen.getByLabelText("User menu for Jane Smith");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
