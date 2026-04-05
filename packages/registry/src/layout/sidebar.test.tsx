import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "./sidebar";

describe("Sidebar", () => {
  it("renders children when open", () => {
    render(
      <Sidebar open={true} onToggle={() => {}}>
        <span>nav content</span>
      </Sidebar>,
    );
    expect(screen.getByText("nav content")).toBeInTheDocument();
  });

  it("has aria-label 'Collapse sidebar' when open", () => {
    render(
      <Sidebar open={true} onToggle={() => {}}>
        <div />
      </Sidebar>,
    );
    expect(screen.getByLabelText("Collapse sidebar")).toBeInTheDocument();
  });

  it("has aria-label 'Expand sidebar' when closed", () => {
    render(
      <Sidebar open={false} onToggle={() => {}}>
        <div />
      </Sidebar>,
    );
    expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument();
  });

  it("calls onToggle when the toggle button is clicked", () => {
    let toggled = false;
    render(
      <Sidebar open={true} onToggle={() => (toggled = true)}>
        <div />
      </Sidebar>,
    );
    fireEvent.click(screen.getByLabelText("Collapse sidebar"));
    expect(toggled).toBe(true);
  });

  it("aside has aria-label 'Sidebar navigation'", () => {
    const { container } = render(
      <Sidebar open={true} onToggle={() => {}}>
        <div />
      </Sidebar>,
    );
    const aside = container.querySelector("aside");
    expect(aside).toHaveAttribute("aria-label", "Sidebar navigation");
  });

  it("toggle button has aria-expanded=true when open", () => {
    render(
      <Sidebar open={true} onToggle={() => {}}>
        <div />
      </Sidebar>,
    );
    expect(screen.getByLabelText("Collapse sidebar")).toHaveAttribute("aria-expanded", "true");
  });

  it("toggle button has aria-expanded=false when closed", () => {
    render(
      <Sidebar open={false} onToggle={() => {}}>
        <div />
      </Sidebar>,
    );
    expect(screen.getByLabelText("Expand sidebar")).toHaveAttribute("aria-expanded", "false");
  });
});
