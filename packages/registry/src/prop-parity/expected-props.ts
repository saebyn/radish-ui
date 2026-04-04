/**
 * Curated expected prop interfaces for radish-ui components.
 *
 * These interfaces are maintained by hand and mirror the prop interfaces of
 * the corresponding react-admin MUI components (ra-ui-materialui).
 *
 * Based on: react-admin v5.x (ra-ui-materialui)
 *
 * ## Updating this file
 *
 * When react-admin releases a new version that changes a component's prop API:
 *   1. Review the react-admin changelog and updated component API docs.
 *   2. Add, remove, or update the prop definitions in the relevant interface
 *      below.
 *   3. Update any radish-ui components that no longer satisfy the updated
 *      expected interface — the prop parity tests will point you to them.
 *
 * No dependency on react-admin or MUI is required here; the expected prop
 * lists are defined by hand so that removing the react-admin package does
 * not affect these tests.
 */

import type React from "react";

// ─── Button Components ────────────────────────────────────────────────────────

/** Expected props for CreateButton, based on ra-ui-materialui CreateButton. */
export interface ExpectedCreateButtonProps {
  resource?: string;
  label?: string;
  className?: string;
}

/** Expected props for EditButton, based on ra-ui-materialui EditButton. */
export interface ExpectedEditButtonProps {
  resource?: string;
  label?: string;
  className?: string;
}

/** Expected props for DeleteButton, based on ra-ui-materialui DeleteButton. */
export interface ExpectedDeleteButtonProps {
  resource?: string;
  label?: string;
  confirmTitle?: string;
  className?: string;
}

// ─── Field Components ─────────────────────────────────────────────────────────

/** Expected props for TextField, based on ra-ui-materialui TextField. */
export interface ExpectedTextFieldProps {
  source: string;
  label?: string;
  className?: string;
}

/** Expected props for BooleanField, based on ra-ui-materialui BooleanField. */
export interface ExpectedBooleanFieldProps {
  source: string;
  label?: string;
  /** Label shown when the value is truthy. */
  trueLabel?: string;
  /** Label shown when the value is falsy. */
  falseLabel?: string;
  className?: string;
}

/** Expected props for NumberField, based on ra-ui-materialui NumberField. */
export interface ExpectedNumberFieldProps {
  source: string;
  label?: string;
  /** Options forwarded to Intl.NumberFormat. */
  options?: Intl.NumberFormatOptions;
  /** Locale string(s) forwarded to Intl.NumberFormat. */
  locales?: string | string[];
  className?: string;
}

/** Expected props for DateField, based on ra-ui-materialui DateField. */
export interface ExpectedDateFieldProps {
  source: string;
  label?: string;
  /** Show time alongside the date. */
  showTime?: boolean;
  /** Options forwarded to Intl.DateTimeFormat. */
  options?: Intl.DateTimeFormatOptions;
  /** Locale string(s) forwarded to Intl.DateTimeFormat. */
  locales?: string | string[];
  className?: string;
}

// ─── Form Components ──────────────────────────────────────────────────────────

/** Expected props for SimpleForm, based on ra-ui-materialui SimpleForm. */
export interface ExpectedSimpleFormProps {
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
}

/** Expected props for TextInput, based on ra-ui-materialui TextInput. */
export interface ExpectedTextInputProps {
  source: string;
  label?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
}

/** Expected props for NumberInput, based on ra-ui-materialui NumberInput. */
export interface ExpectedNumberInputProps {
  source: string;
  label?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

/** Expected props for BooleanInput, based on ra-ui-materialui BooleanInput. */
export interface ExpectedBooleanInputProps {
  source: string;
  label?: string;
  className?: string;
}

/** Expected props for SelectInput, based on ra-ui-materialui SelectInput. */
export interface ExpectedSelectInputProps {
  source: string;
  choices: { id: string; name: string }[];
  label?: string;
  emptyText?: string;
  className?: string;
}

// ─── List Components ──────────────────────────────────────────────────────────

/** Expected props for List, based on ra-ui-materialui List. */
export interface ExpectedListProps {
  children: React.ReactNode;
  resource?: string;
  sort?: { field: string; order: "ASC" | "DESC" };
  filter?: object;
  filterDefaultValues?: object;
  perPage?: number;
  queryOptions?: object;
  disableSyncWithLocation?: boolean;
  storeKey?: string | false;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  filters?: React.ReactElement | React.ReactElement[];
  pagination?: React.ReactNode;
  empty?: React.ReactNode | false;
  emptyWhileLoading?: boolean;
  title?: React.ReactNode | string | false;
  className?: string;
}

/** Expected props for Datagrid, based on ra-ui-materialui Datagrid. */
export interface ExpectedDatagridProps {
  children: React.ReactElement | React.ReactElement[];
  rowActions?: React.ReactNode;
  className?: string;
}

/** Expected props for Pagination, based on ra-ui-materialui Pagination. */
export interface ExpectedPaginationProps {
  siblingCount?: number;
  className?: string;
}

// ─── Detail Components ────────────────────────────────────────────────────────

/** Expected props for Show, based on ra-ui-materialui Show. */
export interface ExpectedShowProps {
  children: React.ReactNode;
  resource?: string;
  id?: string | number;
  queryOptions?: object;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  emptyWhileLoading?: boolean;
  title?: React.ReactNode | string | false;
  className?: string;
}

/** Expected props for Edit, based on ra-ui-materialui Edit. */
export interface ExpectedEditProps {
  children: React.ReactNode;
  resource?: string;
  id?: string | number;
  queryOptions?: object;
  mutationOptions?: object;
  mutationMode?: "undoable" | "optimistic" | "pessimistic";
  redirect?:
    | "list"
    | "show"
    | false
    | ((resource: string | undefined, id: unknown, data: unknown) => string);
  transform?: (data: unknown, options?: { previousData: unknown }) => unknown | Promise<unknown>;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  emptyWhileLoading?: boolean;
  title?: React.ReactNode | string | false;
  className?: string;
}

/** Expected props for Create, based on ra-ui-materialui Create. */
export interface ExpectedCreateProps {
  children: React.ReactNode;
  resource?: string;
  record?: object;
  mutationOptions?: object;
  mutationMode?: "undoable" | "optimistic" | "pessimistic";
  redirect?:
    | "edit"
    | "list"
    | "show"
    | false
    | ((resource: string | undefined, id: unknown, data: unknown) => string);
  transform?: (data: unknown) => unknown | Promise<unknown>;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  title?: React.ReactNode | string | false;
  className?: string;
}

/** Expected props for SimpleShowLayout, based on ra-ui-materialui SimpleShowLayout. */
export interface ExpectedSimpleShowLayoutProps {
  children: React.ReactElement | React.ReactElement[];
  className?: string;
}

// ─── Notification Component ───────────────────────────────────────────────────

/** Expected props for Notification, based on ra-ui-materialui Notification. */
export interface ExpectedNotificationProps {
  className?: string;
}
