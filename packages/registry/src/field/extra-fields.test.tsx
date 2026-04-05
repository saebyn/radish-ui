import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecordContextProvider } from "ra-core";
import { UrlField } from "./url-field";
import { EmailField } from "./email-field";
import { ChipField } from "./chip-field";
import { ArrayField } from "./array-field";

function withRecord(record: Record<string, unknown>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <RecordContextProvider value={record}>{children}</RecordContextProvider>;
  };
}

// ─── UrlField ────────────────────────────────────────────────────────────────

describe("UrlField", () => {
  it("renders a link with the field value as href and display text", () => {
    render(<UrlField source="website" />, {
      wrapper: withRecord({ id: 1, website: "https://example.com" }),
    });
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveTextContent("https://example.com");
  });

  it("truncates display text when maxLength is set", () => {
    render(<UrlField source="website" maxLength={10} />, {
      wrapper: withRecord({ id: 1, website: "https://example.com" }),
    });
    expect(screen.getByRole("link")).toHaveTextContent("https://ex…");
  });

  it("renders a dash when the value is null", () => {
    render(<UrlField source="website" />, {
      wrapper: withRecord({ id: 1, website: null }),
    });
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("opens in a new tab by default", () => {
    render(<UrlField source="website" />, {
      wrapper: withRecord({ id: 1, website: "https://example.com" }),
    });
    expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
  });
});

// ─── EmailField ──────────────────────────────────────────────────────────────

describe("EmailField", () => {
  it("renders a mailto link with the email address", () => {
    render(<EmailField source="email" />, {
      wrapper: withRecord({ id: 1, email: "alice@example.com" }),
    });
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "mailto:alice@example.com");
    expect(link).toHaveTextContent("alice@example.com");
  });

  it("renders a dash when the value is null", () => {
    render(<EmailField source="email" />, {
      wrapper: withRecord({ id: 1, email: null }),
    });
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

// ─── ChipField ───────────────────────────────────────────────────────────────

describe("ChipField", () => {
  it("renders the field value as a chip", () => {
    render(<ChipField source="status" />, {
      wrapper: withRecord({ id: 1, status: "active" }),
    });
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("renders nothing when the value is null", () => {
    const { container } = render(<ChipField source="status" />, {
      wrapper: withRecord({ id: 1, status: null }),
    });
    expect(container.firstChild).toBeNull();
  });

  it("applies a custom color class", () => {
    const { container } = render(<ChipField source="status" color="green" />, {
      wrapper: withRecord({ id: 1, status: "ok" }),
    });
    expect(container.querySelector(".bg-success-100")).toBeInTheDocument();
  });
});

// ─── ArrayField ──────────────────────────────────────────────────────────────

describe("ArrayField", () => {
  it("renders a chip for each array item", () => {
    render(
      <RecordContextProvider
        value={{
          id: 1,
          tags: [
            { id: 1, name: "React" },
            { id: 2, name: "TypeScript" },
          ],
        }}
      >
        <ArrayField source="tags">
          <ChipField source="name" />
        </ArrayField>
      </RecordContextProvider>,
    );
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("renders a dash when the array is empty", () => {
    render(
      <RecordContextProvider value={{ id: 1, tags: [] }}>
        <ArrayField source="tags">
          <ChipField source="name" />
        </ArrayField>
      </RecordContextProvider>,
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders a dash when the value is not an array", () => {
    render(
      <ArrayField source="tags">
        <ChipField source="name" />
      </ArrayField>,
      {
        wrapper: withRecord({ id: 1, tags: null }),
      },
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders items inside a semantic list element", () => {
    const { container } = render(
      <RecordContextProvider
        value={{
          id: 1,
          tags: [
            { id: 1, name: "React" },
            { id: 2, name: "TypeScript" },
          ],
        }}
      >
        <ArrayField source="tags">
          <ChipField source="name" />
        </ArrayField>
      </RecordContextProvider>,
    );
    expect(container.querySelector("ul")).toBeInTheDocument();
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });
});
