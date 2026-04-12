import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Layout } from "./layout";

vi.mock("./user-menu", () => ({
  UserMenu: () => <div data-testid="user-menu" />,
}));

vi.mock("./sidebar", () => ({
  Sidebar: ({
    open,
    onToggle,
    children,
  }: {
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <div data-testid="sidebar" data-open={open}>
      <button onClick={onToggle}>toggle</button>
      {children}
    </div>
  ),
}));

vi.mock("./menu", () => ({
  Menu: ({ open }: { open: boolean }) => <div data-testid="menu" data-open={open} />,
}));

describe("Layout", () => {
  it("renders the default title when no title prop is given", () => {
    render(<Layout />);
    expect(screen.getByText("radish-ui")).toBeInTheDocument();
  });

  it("renders a custom string title", () => {
    render(<Layout title="My App" />);
    expect(screen.getByText("My App")).toBeInTheDocument();
  });

  it("renders children inside the main content area", () => {
    render(
      <Layout>
        <p>Page content</p>
      </Layout>,
    );
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("sidebar starts open", () => {
    render(<Layout />);
    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "true");
  });

  it("toggles sidebar open/closed when toggle is called", () => {
    render(<Layout />);
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "false");
  });
});
