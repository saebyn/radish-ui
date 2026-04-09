import { useMemo } from "react";
import { useGetList } from "ra-core";
import { Create } from "../detail/create";
import { SelectArrayInput } from "../form/select-array-input";
import { NumberInput } from "../form/number-input";
import { SelectInput } from "../form/select-input";
import { TextInput } from "../form/text-input";
import { WizardForm } from "../form/wizard-form";

export function ProjectsCreate() {
  const { data: streams = [] } = useGetList("streams", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "id", order: "ASC" },
  });

  const streamChoices = useMemo(
    () => streams.map((stream) => ({ id: stream.id, name: String(stream.title ?? stream.id) })),
    [streams],
  );

  return (
    <Create resource="projects">
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

        <WizardForm.Step
          label="Sources"
          description="Attach source streams and capture timing metadata."
        >
          <SelectArrayInput source="streams" label="Source Streams" choices={streamChoices} />
          <TextInput source="created_at" label="Created At" />
        </WizardForm.Step>
      </WizardForm>
    </Create>
  );
}
