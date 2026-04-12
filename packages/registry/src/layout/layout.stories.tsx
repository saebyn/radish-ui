import type { Meta, StoryObj } from "@storybook/react";
import { CoreAdminContext } from "ra-core";
import { MemoryRouter } from "react-router-dom";
import { Layout } from "./layout";

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

const authProvider = {
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  checkAuth: () => Promise.resolve(),
  checkError: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(),
  getIdentity: () => Promise.resolve({ id: 1, fullName: "Jane Smith" }),
};

const mockResources = {
  posts: { name: "posts", hasList: true, hasEdit: true, hasShow: true, hasCreate: true },
  users: { name: "users", hasList: true, hasEdit: true, hasShow: true, hasCreate: true },
};

const meta: Meta<typeof Layout> = {
  title: "Layout/Layout",
  component: Layout,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <CoreAdminContext
          dataProvider={dataProvider}
          authProvider={authProvider}
          resources={Object.values(mockResources)}
        >
          <div style={{ height: "100vh" }}>
            <Story />
          </div>
        </CoreAdminContext>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Layout>;

export const Default: Story = {
  args: {
    title: "radish-ui Demo",
    children: (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">Welcome</h2>
        <p className="mt-2 text-sm text-gray-600">
          Select a resource from the sidebar to get started.
        </p>
      </div>
    ),
  },
};

export const WithContent: Story = {
  render: () => (
    <Layout title="My Admin App">
      <div className="space-y-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">
            This is the main content area. The sidebar on the left shows navigation links for all
            registered resources.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {["Posts", "Users"].map((label) => (
            <div key={label} className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-800">42</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  ),
};
