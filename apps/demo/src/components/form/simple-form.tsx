import React from "react";
import { Form, useSaveContext } from "ra-core";
import { cn } from "@radish-ui/core";

interface SimpleFormProps {
  /** Input components as children */
  children: React.ReactNode;
  /** Label for the submit button. Default: "Save" */
  submitLabel?: string;
  className?: string;
}

/**
 * Simple form wrapper for use inside <EditBase> or <CreateBase>.
 * Renders children as a vertical stack of inputs with a Save button toolbar.
 *
 * Uses ra-core's <Form> (which wires react-hook-form to the SaveContext)
 * and reads the `saving` boolean from useSaveContext to disable the submit button.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <Edit resource="posts">
 *   <SimpleForm>
 *     <TextInput source="title" label="Title" />
 *     <TextInput source="body" label="Body" multiline />
 *   </SimpleForm>
 * </Edit>
 */
export function SimpleForm({ children, submitLabel = "Save", className }: SimpleFormProps) {
  return (
    <Form>
      <SimpleFormContent className={className} submitLabel={submitLabel}>
        {children}
      </SimpleFormContent>
    </Form>
  );
}

function SimpleFormContent({
  children,
  submitLabel,
  className,
}: {
  children: React.ReactNode;
  submitLabel: string;
  className?: string;
}) {
  const { saving } = useSaveContext();

  return (
    <div className={cn("rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800", className)}>
      <div className="space-y-5 px-6 py-6">{children}</div>
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
