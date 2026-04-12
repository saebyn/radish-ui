import type { Meta, StoryObj } from "@storybook/react";
import { CoreAdminContext } from "ra-core";
import { MemoryRouter } from "react-router-dom";
import { UserMenu, UserMenuItem } from "./user-menu";

// ---------------------------------------------------------------------------
// Helpers
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

function makeAuthProvider(fullName?: string) {
  return {
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
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
  fullName?: string;
  noAuth?: boolean;
}

function Wrapper({ children, fullName, noAuth = false }: WrapperProps) {
  return (
    <MemoryRouter>
      <CoreAdminContext
        dataProvider={dataProvider}
        authProvider={noAuth ? undefined : makeAuthProvider(fullName)}
      >
        {/* Simulate a header bar */}
        <div className="flex h-12 items-center bg-primary-700 px-4">
          <span className="text-lg font-semibold text-white">My App</span>
          <div className="ml-auto">{children}</div>
        </div>
      </CoreAdminContext>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof UserMenu> = {
  title: "Layout/UserMenu",
  component: UserMenu,
};

export default meta;
type Story = StoryObj<typeof UserMenu>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: "Default (with identity)",
  render: (args) => (
    <Wrapper>
      <UserMenu {...args} />
    </Wrapper>
  ),
};

export const NoIdentity: Story = {
  name: "No auth provider (anonymous)",
  render: (args) => (
    <Wrapper noAuth>
      <UserMenu {...args} />
    </Wrapper>
  ),
};

export const WithCustomItems: Story = {
  name: "With custom menu items",
  render: (args) => (
    <Wrapper>
      <UserMenu {...args}>
        <UserMenuItem
          icon={
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
            </svg>
          }
        >
          My Profile
        </UserMenuItem>
        <UserMenuItem
          icon={
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                clipRule="evenodd"
              />
            </svg>
          }
        >
          Settings
        </UserMenuItem>
      </UserMenu>
    </Wrapper>
  ),
};

export const CustomLogoutLabel: Story = {
  name: "Custom logout label",
  render: (args) => (
    <Wrapper>
      <UserMenu {...args} logoutLabel="Sign out" />
    </Wrapper>
  ),
};

export const LongName: Story = {
  name: "Long display name (truncated)",
  render: (args) => (
    <Wrapper fullName="Bartholomew Frankenstein-Dracula III">
      <UserMenu {...args} />
    </Wrapper>
  ),
};
