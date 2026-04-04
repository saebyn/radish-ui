import React, { useState } from "react";
import { Form, useSaveContext } from "ra-core";
import { cn } from "@radish-ui/core";

interface FormTabProps {
  /** Tab heading label. */
  label: string;
  /** Input components for this tab. */
  children: React.ReactNode;
  className?: string;
}

/**
 * A single tab for use inside `<TabbedForm>`.
 * The `label` prop is used as the tab button text.
 *
 * @example
 * <TabbedForm>
 *   <FormTab label="Details">
 *     <TextInput source="title" />
 *   </FormTab>
 *   <FormTab label="Settings">
 *     <BooleanInput source="published" />
 *   </FormTab>
 * </TabbedForm>
 */
export function FormTab({ children, className }: FormTabProps) {
  return <div className={cn("space-y-5 px-6 py-6", className)}>{children}</div>;
}

interface TabbedFormProps {
  /** `<FormTab>` components. */
  children: React.ReactElement<FormTabProps> | React.ReactElement<FormTabProps>[];
  /** Label for the submit button. Default: "Save". */
  submitLabel?: string;
  className?: string;
}

/**
 * Tabbed form wrapper for use inside `<EditBase>` or `<CreateBase>`.
 * Each `<FormTab label="…">` child becomes a tab.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <Edit resource="posts">
 *   <TabbedForm>
 *     <FormTab label="Content">
 *       <TextInput source="title" />
 *       <TextInput source="body" multiline />
 *     </FormTab>
 *     <FormTab label="Settings">
 *       <BooleanInput source="published" />
 *     </FormTab>
 *   </TabbedForm>
 * </Edit>
 */
export function TabbedForm({ children, submitLabel = "Save", className }: TabbedFormProps) {
  return (
    <Form>
      <TabbedFormContent className={className} submitLabel={submitLabel}>
        {children}
      </TabbedFormContent>
    </Form>
  );
}

function TabbedFormContent({
  children,
  submitLabel,
  className,
}: {
  children: React.ReactElement<FormTabProps> | React.ReactElement<FormTabProps>[];
  submitLabel: string;
  className?: string;
}) {
  const { saving } = useSaveContext();
  const tabs = React.Children.toArray(children) as React.ReactElement<FormTabProps>[];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800",
        className,
      )}
    >
      {/* Tab bar */}
      <div role="tablist" className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab, i) => (
          <button
            key={i}
            role="tab"
            type="button"
            id={`form-tab-${i}`}
            aria-selected={activeIndex === i}
            aria-controls={`form-tabpanel-${i}`}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500",
              activeIndex === i
                ? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
            )}
          >
            {tab.props.label}
          </button>
        ))}
      </div>

      {/* Active panel */}
      {tabs.map((tab, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`form-tabpanel-${i}`}
          aria-labelledby={`form-tab-${i}`}
          hidden={activeIndex !== i}
        >
          {tab}
        </div>
      ))}

      {/* Footer toolbar */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700 px-6 py-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
