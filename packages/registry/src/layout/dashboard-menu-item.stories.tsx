import type { Meta, StoryObj } from "@storybook/react";
import { HasDashboardContextProvider } from "ra-core";
import { MemoryRouter } from "react-router-dom";
import { DashboardMenuItem } from "./dashboard-menu-item";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface WrapperProps {
  children: React.ReactNode;
  /** Set to true to register a dashboard component with ra-core */
  hasDashboard?: boolean;
}

function Wrapper({ children, hasDashboard = true }: WrapperProps) {
  return (
    <MemoryRouter>
      <HasDashboardContextProvider value={hasDashboard}>
        <ul className="space-y-1 px-2 bg-canvas-800 w-56 p-2 rounded-md">
          <li>{children}</li>
        </ul>
      </HasDashboardContextProvider>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof DashboardMenuItem> = {
  title: "Layout/DashboardMenuItem",
  component: DashboardMenuItem,
};

export default meta;
type Story = StoryObj<typeof DashboardMenuItem>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: "Default (sidebar open)",
  render: (args) => (
    <Wrapper>
      <DashboardMenuItem {...args} />
    </Wrapper>
  ),
  args: {
    open: true,
    label: "Home",
  },
};

export const SidebarClosed: Story = {
  name: "Sidebar closed (icon only)",
  render: (args) => (
    <Wrapper>
      <DashboardMenuItem {...args} />
    </Wrapper>
  ),
  args: {
    open: false,
    label: "Home",
  },
};

export const CustomLabel: Story = {
  name: "Custom label",
  render: (args) => (
    <Wrapper>
      <DashboardMenuItem {...args} />
    </Wrapper>
  ),
  args: {
    open: true,
    label: "Dashboard",
  },
};

export const NoDashboard: Story = {
  name: "Hidden when no dashboard registered",
  render: (args) => (
    <Wrapper hasDashboard={false}>
      <DashboardMenuItem {...args} />
    </Wrapper>
  ),
  args: {
    open: true,
    label: "Home",
  },
};
