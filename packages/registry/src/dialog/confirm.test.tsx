import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Confirm } from "./confirm";

describe("Confirm", () => {
  it("renders nothing interactive when isOpen is false", () => {
    render(<Confirm isOpen={false} title="Delete?" onConfirm={vi.fn()} onClose={vi.fn()} />);
    // dialog element exists but is not open
    const dialog = document.querySelector("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).not.toHaveAttribute("open");
  });

  it("opens the dialog when isOpen becomes true", () => {
    const { rerender } = render(
      <Confirm isOpen={false} title="Delete?" onConfirm={vi.fn()} onClose={vi.fn()} />,
    );
    rerender(<Confirm isOpen={true} title="Delete?" onConfirm={vi.fn()} onClose={vi.fn()} />);
    expect(document.querySelector("dialog")).toHaveAttribute("open");
  });

  it("renders the title and content", () => {
    render(
      <Confirm
        isOpen={true}
        title="Are you sure?"
        content="This cannot be undone."
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(<Confirm isOpen={true} title="Delete?" onConfirm={onConfirm} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onClose when cancel button is clicked", () => {
    const onClose = vi.fn();
    render(<Confirm isOpen={true} title="Delete?" onConfirm={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders custom button labels", () => {
    render(
      <Confirm
        isOpen={true}
        title="Publish?"
        confirmLabel="Yes, publish"
        cancelLabel="Not yet"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Yes, publish" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Not yet" })).toBeInTheDocument();
  });
});
