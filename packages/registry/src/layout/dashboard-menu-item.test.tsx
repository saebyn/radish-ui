import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { HasDashboardContextProvider } from "ra-core";
import { MemoryRouter } from "react-router-dom";
import { DashboardMenuItem } from "./dashboard-menu-item";

afterEach(cleanup);

function Wrapper({
  children,
  hasDashboard = true,
}: {
  children: React.ReactNode;
  hasDashboard?: boolean;
}) {
  return (
    <MemoryRouter>
      <HasDashboardContextProvider value={hasDashboard}>
        {children}
      </HasDashboardContextProvider>
    </MemoryRouter>
  );
}

describe("DashboardMenuItem", () => {
  it("renders nothing when no dashboard is registered", () => {
    const { container } = render(
      <Wrapper hasDashboard={false}>
        <DashboardMenuItem />
      </Wrapper>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders a link with default label 'Home' when a dashboard is registered", () => {
    render(
      <Wrapper>
        <DashboardMenuItem />
      </Wrapper>,
    );
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
  });

  it("renders a link with a custom label", () => {
    render(
      <Wrapper>
        <DashboardMenuItem label="Dashboard" />
      </Wrapper>,
    );
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
  });

  it("links to '/' by default", () => {
    render(
      <Wrapper>
        <DashboardMenuItem />
      </Wrapper>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/");
  });

  it("links to a custom route when 'to' prop is provided", () => {
    render(
      <Wrapper>
        <DashboardMenuItem to="/admin" />
      </Wrapper>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/admin");
  });

  it("shows the label as visible text when open=true", () => {
    render(
      <Wrapper>
        <DashboardMenuItem open={true} label="Home" />
      </Wrapper>,
    );
    const label = screen.getByText("Home");
    expect(label).not.toHaveClass("sr-only");
  });

  it("hides the label with sr-only when open=false", () => {
    render(
      <Wrapper>
        <DashboardMenuItem open={false} label="Home" />
      </Wrapper>,
    );
    const label = screen.getByText("Home");
    expect(label).toHaveClass("sr-only");
  });
});
