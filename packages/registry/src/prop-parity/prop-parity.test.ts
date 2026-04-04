/**
 * Prop parity tests for radish-ui components.
 *
 * Each test asserts that the component's TypeScript props are a superset of the
 * corresponding expected interface defined in ./expected-props.ts.  The tests
 * fail at the TypeScript level (caught by `vitest typecheck`) if:
 *
 *   - A required prop listed in the expected interface is absent from the
 *     component, or
 *   - A prop's type is not assignable to the expected type.
 *
 * To update the expected prop lists, edit ./expected-props.ts and then fix
 * any radish-ui components whose props no longer satisfy the updated interface.
 */

import { describe, it, expectTypeOf } from "vitest";
import type { ComponentProps } from "react";

import type { CreateButton } from "../button/create-button";
import type { EditButton } from "../button/edit-button";
import type { DeleteButton } from "../button/delete-button";

import type { TextField } from "../field/text-field";
import type { BooleanField } from "../field/boolean-field";
import type { NumberField } from "../field/number-field";
import type { DateField } from "../field/date-field";

import type { SimpleForm } from "../form/simple-form";
import type { TextInput } from "../form/text-input";
import type { NumberInput } from "../form/number-input";
import type { BooleanInput } from "../form/boolean-input";
import type { SelectInput } from "../form/select-input";

import type { List } from "../list/list";
import type { Datagrid } from "../list/datagrid";
import type { Pagination } from "../list/pagination";

import type { Show } from "../detail/show";
import type { Edit } from "../detail/edit";
import type { Create } from "../detail/create";
import type { SimpleShowLayout } from "../detail/simple-show-layout";

import type { Notification } from "../notification/notification";

import type {
  ExpectedCreateButtonProps,
  ExpectedEditButtonProps,
  ExpectedDeleteButtonProps,
  ExpectedTextFieldProps,
  ExpectedBooleanFieldProps,
  ExpectedNumberFieldProps,
  ExpectedDateFieldProps,
  ExpectedSimpleFormProps,
  ExpectedTextInputProps,
  ExpectedNumberInputProps,
  ExpectedBooleanInputProps,
  ExpectedSelectInputProps,
  ExpectedListProps,
  ExpectedDatagridProps,
  ExpectedPaginationProps,
  ExpectedShowProps,
  ExpectedEditProps,
  ExpectedCreateProps,
  ExpectedSimpleShowLayoutProps,
  ExpectedNotificationProps,
} from "./expected-props";

// ─── Button Components ────────────────────────────────────────────────────────

describe("Prop parity: Button components", () => {
  it("CreateButton accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof CreateButton>>().toMatchTypeOf<ExpectedCreateButtonProps>();
  });

  it("EditButton accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof EditButton>>().toMatchTypeOf<ExpectedEditButtonProps>();
  });

  it("DeleteButton accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof DeleteButton>>().toMatchTypeOf<ExpectedDeleteButtonProps>();
  });
});

// ─── Field Components ─────────────────────────────────────────────────────────

describe("Prop parity: Field components", () => {
  it("TextField accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof TextField>>().toMatchTypeOf<ExpectedTextFieldProps>();
  });

  it("BooleanField accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof BooleanField>>().toMatchTypeOf<ExpectedBooleanFieldProps>();
  });

  it("NumberField accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof NumberField>>().toMatchTypeOf<ExpectedNumberFieldProps>();
  });

  it("DateField accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof DateField>>().toMatchTypeOf<ExpectedDateFieldProps>();
  });
});

// ─── Form Components ──────────────────────────────────────────────────────────

describe("Prop parity: Form components", () => {
  it("SimpleForm accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof SimpleForm>>().toMatchTypeOf<ExpectedSimpleFormProps>();
  });

  it("TextInput accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof TextInput>>().toMatchTypeOf<ExpectedTextInputProps>();
  });

  it("NumberInput accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof NumberInput>>().toMatchTypeOf<ExpectedNumberInputProps>();
  });

  it("BooleanInput accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof BooleanInput>>().toMatchTypeOf<ExpectedBooleanInputProps>();
  });

  it("SelectInput accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof SelectInput>>().toMatchTypeOf<ExpectedSelectInputProps>();
  });
});

// ─── List Components ──────────────────────────────────────────────────────────

describe("Prop parity: List components", () => {
  it("List accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof List>>().toMatchTypeOf<ExpectedListProps>();
  });

  it("Datagrid accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof Datagrid>>().toMatchTypeOf<ExpectedDatagridProps>();
  });

  it("Pagination accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof Pagination>>().toMatchTypeOf<ExpectedPaginationProps>();
  });
});

// ─── Detail Components ────────────────────────────────────────────────────────

describe("Prop parity: Detail components", () => {
  it("Show accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof Show>>().toMatchTypeOf<ExpectedShowProps>();
  });

  it("Edit accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof Edit>>().toMatchTypeOf<ExpectedEditProps>();
  });

  it("Create accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof Create>>().toMatchTypeOf<ExpectedCreateProps>();
  });

  it("SimpleShowLayout accepts all expected props", () => {
    expectTypeOf<
      ComponentProps<typeof SimpleShowLayout>
    >().toMatchTypeOf<ExpectedSimpleShowLayoutProps>();
  });
});

// ─── Notification Component ───────────────────────────────────────────────────

describe("Prop parity: Notification component", () => {
  it("Notification accepts all expected props", () => {
    expectTypeOf<ComponentProps<typeof Notification>>().toMatchTypeOf<ExpectedNotificationProps>();
  });
});
