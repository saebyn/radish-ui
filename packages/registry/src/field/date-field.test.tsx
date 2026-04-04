import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecordContextProvider } from "ra-core";
import { DateField } from "./date-field";

function withRecord(record: Record<string, unknown>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <RecordContextProvider value={record}>{children}</RecordContextProvider>;
  };
}

describe("DateField", () => {
  it("renders a formatted date from an ISO string", () => {
    render(<DateField source="created_at" locales="en-US" />, {
      wrapper: withRecord({ id: 1, created_at: "2024-01-15T00:00:00.000Z" }),
    });
    // Intl.DateTimeFormat with year/month/day
    expect(screen.getByText(/Jan.*2024|2024.*Jan/)).toBeInTheDocument();
  });

  it("renders a dash when the value is null", () => {
    render(<DateField source="published_at" />, {
      wrapper: withRecord({ id: 1, published_at: null }),
    });
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders a dash when the value is an empty string", () => {
    render(<DateField source="published_at" />, {
      wrapper: withRecord({ id: 1, published_at: "" }),
    });
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders the raw value for an invalid date string", () => {
    render(<DateField source="bad_date" />, {
      wrapper: withRecord({ id: 1, bad_date: "not-a-date" }),
    });
    expect(screen.getByText("not-a-date")).toBeInTheDocument();
  });

  it("renders a <time> element with a dateTime attribute", () => {
    const isoDate = "2024-06-01T00:00:00.000Z";
    render(<DateField source="created_at" />, {
      wrapper: withRecord({ id: 1, created_at: isoDate }),
    });
    const timeEl = document.querySelector("time");
    expect(timeEl).toBeInTheDocument();
    expect(timeEl?.getAttribute("dateTime")).toBe(new Date(isoDate).toISOString());
  });

  it("accepts a numeric timestamp", () => {
    const ts = new Date("2023-03-10").getTime();
    render(<DateField source="ts" locales="en-US" />, {
      wrapper: withRecord({ id: 1, ts }),
    });
    expect(screen.getByText(/Mar.*2023|2023.*Mar/)).toBeInTheDocument();
  });

  it("accepts a Date object", () => {
    render(<DateField source="dt" locales="en-US" />, {
      wrapper: withRecord({ id: 1, dt: new Date("2025-07-04") }),
    });
    expect(screen.getByText(/Jul.*2025|2025.*Jul/)).toBeInTheDocument();
  });
});
