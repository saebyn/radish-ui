import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CoreAdminContext, Form, SaveContextProvider } from "ra-core";
import { TextInput } from "./text-input";
import { NumberInput } from "./number-input";
import { SelectInput } from "./select-input";
import { BooleanInput } from "./boolean-input";
import { PasswordInput } from "./password-input";
import { SimpleForm } from "./simple-form";

// Minimal data provider required by CoreAdminContext
const dataProvider = {
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getOne: () => Promise.resolve({ data: { id: 1 } as never }),
  getMany: () => Promise.resolve({ data: [] as never }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  create: () => Promise.resolve({ data: { id: 2 } as never }),
  update: () => Promise.resolve({ data: { id: 1 } as never }),
  updateMany: () => Promise.resolve({ data: [] as never }),
  delete: () => Promise.resolve({ data: { id: 1 } as never }),
  deleteMany: () => Promise.resolve({ data: [] as never }),
};

// Wraps inputs inside a react-hook-form Form context (no save needed)
function FormWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CoreAdminContext dataProvider={dataProvider}>
      <Form>{children}</Form>
    </CoreAdminContext>
  );
}

describe("TextInput", () => {
  it("renders with a capitalised source as the default label", () => {
    render(<TextInput source="title" />, { wrapper: FormWrapper });
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("renders with an explicit label", () => {
    render(<TextInput source="name" label="Full Name" />, { wrapper: FormWrapper });
    expect(screen.getByText("Full Name")).toBeInTheDocument();
  });

  it("renders a text input", () => {
    render(<TextInput source="title" />, { wrapper: FormWrapper });
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders a textarea when multiline is true", () => {
    render(<TextInput source="body" multiline />, { wrapper: FormWrapper });
    expect(document.querySelector("textarea")).toBeInTheDocument();
  });

  it("associates the label with the input via htmlFor/id", () => {
    render(<TextInput source="title" label="Title" />, { wrapper: FormWrapper });
    const label = screen.getByText("Title");
    const input = screen.getByRole("textbox");
    expect(label.getAttribute("for")).toBe(input.getAttribute("id"));
  });

  it("renders a placeholder when provided", () => {
    render(<TextInput source="title" placeholder="Enter title…" />, { wrapper: FormWrapper });
    expect(screen.getByPlaceholderText("Enter title…")).toBeInTheDocument();
  });

  it("accepts user input", () => {
    render(<TextInput source="title" />, { wrapper: FormWrapper });
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "New value" } });
    expect((input as HTMLInputElement).value).toBe("New value");
  });
});

describe("NumberInput", () => {
  it("renders with a capitalised source as the default label", () => {
    render(<NumberInput source="price" />, { wrapper: FormWrapper });
    expect(screen.getByText("Price")).toBeInTheDocument();
  });

  it("renders an input of type number", () => {
    render(<NumberInput source="price" />, { wrapper: FormWrapper });
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("sets min, max and step attributes", () => {
    render(<NumberInput source="price" min={0} max={100} step={0.5} />, {
      wrapper: FormWrapper,
    });
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "100");
    expect(input).toHaveAttribute("step", "0.5");
  });

  it("accepts user input", () => {
    render(<NumberInput source="price" />, { wrapper: FormWrapper });
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "42" } });
    expect((input as HTMLInputElement).value).toBe("42");
  });
});

describe("SelectInput", () => {
  const choices = [
    { id: "draft", name: "Draft" },
    { id: "published", name: "Published" },
  ];

  it("renders with a capitalised source as the default label", () => {
    render(<SelectInput source="status" choices={choices} />, { wrapper: FormWrapper });
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders all choices as options", () => {
    render(<SelectInput source="status" choices={choices} />, { wrapper: FormWrapper });
    expect(screen.getByRole("option", { name: "Draft" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Published" })).toBeInTheDocument();
  });

  it("renders the default empty option", () => {
    render(<SelectInput source="status" choices={choices} />, { wrapper: FormWrapper });
    expect(screen.getByRole("option", { name: "— select —" })).toBeInTheDocument();
  });

  it("renders a custom empty option text", () => {
    render(<SelectInput source="status" choices={choices} emptyText="Choose…" />, {
      wrapper: FormWrapper,
    });
    expect(screen.getByRole("option", { name: "Choose…" })).toBeInTheDocument();
  });

  it("accepts selection changes", () => {
    render(<SelectInput source="status" choices={choices} />, { wrapper: FormWrapper });
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "published" } });
    expect((select as HTMLSelectElement).value).toBe("published");
  });
});

describe("BooleanInput", () => {
  it("renders with a capitalised source as the default label", () => {
    render(<BooleanInput source="is_published" />, { wrapper: FormWrapper });
    expect(screen.getByText("Is published")).toBeInTheDocument();
  });

  it("renders with an explicit label", () => {
    render(<BooleanInput source="is_published" label="Published?" />, { wrapper: FormWrapper });
    expect(screen.getByText("Published?")).toBeInTheDocument();
  });

  it("renders a checkbox input", () => {
    render(<BooleanInput source="is_published" />, { wrapper: FormWrapper });
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("toggles when clicked", () => {
    render(<BooleanInput source="is_published" />, { wrapper: FormWrapper });
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    const initial = checkbox.checked;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(!initial);
  });
});

describe("PasswordInput", () => {
  it("renders with a capitalised source as the default label", () => {
    render(<PasswordInput source="password" />, { wrapper: FormWrapper });
    expect(screen.getByText("Password")).toBeInTheDocument();
  });

  it("renders with an explicit label", () => {
    render(<PasswordInput source="password" label="Secret" />, { wrapper: FormWrapper });
    expect(screen.getByText("Secret")).toBeInTheDocument();
  });

  it("renders an input of type password by default", () => {
    render(<PasswordInput source="password" />, { wrapper: FormWrapper });
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it("toggles password visibility when the show/hide button is clicked", () => {
    render(<PasswordInput source="password" />, { wrapper: FormWrapper });
    const input = document.querySelector("input") as HTMLInputElement;
    expect(input.type).toBe("password");
    const toggle = screen.getByRole("button", { name: /show password/i });
    fireEvent.click(toggle);
    expect(input.type).toBe("text");
    fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
    expect(input.type).toBe("password");
  });

  it("associates the label with the input via htmlFor/id", () => {
    render(<PasswordInput source="password" label="Password" />, { wrapper: FormWrapper });
    const label = screen.getByText("Password");
    const input = document.querySelector("input") as HTMLInputElement;
    expect(label.getAttribute("for")).toBe(input.getAttribute("id"));
  });

  it("renders a placeholder when provided", () => {
    render(<PasswordInput source="password" placeholder="Enter password…" />, {
      wrapper: FormWrapper,
    });
    expect(screen.getByPlaceholderText("Enter password…")).toBeInTheDocument();
  });

  it("accepts user input", () => {
    render(<PasswordInput source="password" />, { wrapper: FormWrapper });
    const input = document.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "s3cret!" } });
    expect(input.value).toBe("s3cret!");
  });
});

describe("SimpleForm", () => {
  it("renders children", () => {
    const save = vi.fn();
    render(
      <CoreAdminContext dataProvider={dataProvider}>
        <SaveContextProvider value={{ save, saving: false, mutationMode: "pessimistic" }}>
          <SimpleForm>
            <TextInput source="title" />
          </SimpleForm>
        </SaveContextProvider>
      </CoreAdminContext>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("renders the Save button with default label", () => {
    const save = vi.fn();
    render(
      <CoreAdminContext dataProvider={dataProvider}>
        <SaveContextProvider value={{ save, saving: false, mutationMode: "pessimistic" }}>
          <SimpleForm />
        </SaveContextProvider>
      </CoreAdminContext>,
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("renders the Save button with a custom label", () => {
    const save = vi.fn();
    render(
      <CoreAdminContext dataProvider={dataProvider}>
        <SaveContextProvider value={{ save, saving: false, mutationMode: "pessimistic" }}>
          <SimpleForm submitLabel="Submit" />
        </SaveContextProvider>
      </CoreAdminContext>,
    );
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("disables the Save button while saving", () => {
    const save = vi.fn();
    render(
      <CoreAdminContext dataProvider={dataProvider}>
        <SaveContextProvider value={{ save, saving: true, mutationMode: "pessimistic" }}>
          <SimpleForm />
        </SaveContextProvider>
      </CoreAdminContext>,
    );
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  });
});
