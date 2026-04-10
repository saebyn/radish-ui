import type { Meta, StoryObj } from "@storybook/react";
import { CoreAdminContext, CreateBase } from "ra-core";
import React from "react";
import { WizardForm } from "./wizard-form";
import { TextInput } from "./text-input";
import { NumberInput } from "./number-input";
import { SelectInput } from "./select-input";

const defaultValues = {
  title: "",
  description: "",
  series_id: 1,
  owner_id: 1,
  status: "draft",
  streams: [],
  created_at: new Date().toISOString(),
};

/**
 * Wraps children in a CreateBase so that react-hook-form context is available.
 * defaultValues pre-populates the form fields.
 */
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <CoreAdminContext>
    <CreateBase resource="projects" record={defaultValues}>
      <div className="max-w-2xl p-6">{children}</div>
    </CreateBase>
  </CoreAdminContext>
);

const meta: Meta<typeof WizardForm> = {
  title: "Form/WizardForm",
  component: WizardForm,
};

export default meta;
type Story = StoryObj<typeof WizardForm>;

export const BasicThreeSteps: Story = {
  name: "Three Steps (Basic)",
  render: () => (
    <Wrapper>
      <WizardForm submitLabel="Create Project">
        <WizardForm.Step
          label="Basics"
          description="Define the project title and short description."
        >
          <TextInput source="title" label="Title" />
          <TextInput source="description" label="Description" multiline rows={4} />
        </WizardForm.Step>

        <WizardForm.Step label="Ownership" description="Set series, owner, and workflow status.">
          <NumberInput source="series_id" label="Series ID" min={1} />
          <NumberInput source="owner_id" label="Owner ID" min={1} />
          <SelectInput
            source="status"
            label="Status"
            choices={[
              { id: "draft", name: "Draft" },
              { id: "in_review", name: "In Review" },
              { id: "published", name: "Published" },
            ]}
          />
        </WizardForm.Step>

        <WizardForm.Step label="Review" description="Review your project details before creating.">
          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              All project details are ready. Click <strong>Create Project</strong> to proceed.
            </p>
          </div>
        </WizardForm.Step>
      </WizardForm>
    </Wrapper>
  ),
};

export const TwoSteps: Story = {
  name: "Two Steps (Minimal)",
  render: () => (
    <Wrapper>
      <WizardForm submitLabel="Save">
        <WizardForm.Step label="Basic Info">
          <TextInput source="title" label="Project Title" />
        </WizardForm.Step>

        <WizardForm.Step label="Submit">
          <div className="rounded-md border border-success-200 bg-success-50 p-4 dark:border-success-800 dark:bg-success-900/30">
            <p className="text-sm text-success-800 dark:text-success-200">
              Ready to save your project.
            </p>
          </div>
        </WizardForm.Step>
      </WizardForm>
    </Wrapper>
  ),
};

export const WithoutDescription: Story = {
  name: "Steps Without Descriptions",
  render: () => (
    <Wrapper>
      <WizardForm submitLabel="Create" nextLabel="Continue" backLabel="Previous">
        <WizardForm.Step label="Step One">
          <TextInput source="title" label="Title" />
        </WizardForm.Step>

        <WizardForm.Step label="Step Two">
          <NumberInput source="series_id" label="Series ID" min={1} />
        </WizardForm.Step>

        <WizardForm.Step label="Step Three">
          <SelectInput
            source="status"
            label="Status"
            choices={[
              { id: "draft", name: "Draft" },
              { id: "in_review", name: "In Review" },
            ]}
          />
        </WizardForm.Step>
      </WizardForm>
    </Wrapper>
  ),
};
