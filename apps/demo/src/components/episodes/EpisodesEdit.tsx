import { Edit } from "../detail/edit";
import { NumberInput } from "../form/number-input";
import { SelectInput } from "../form/select-input";
import { SimpleForm } from "../form/simple-form";
import { TextInput } from "../form/text-input";

export function EpisodesEdit() {
  return (
    <Edit resource="episodes" mutationMode="pessimistic">
      <SimpleForm>
        <NumberInput source="project_id" label="Project ID" min={1} />
        <NumberInput source="series_id" label="Series ID" min={1} />
        <TextInput source="title" label="Title" />
        <TextInput source="description" label="Description" multiline rows={4} />
        <SelectInput
          source="publish_status"
          label="Publish Status"
          choices={[
            { id: "ready", name: "Ready" },
            { id: "published", name: "Published" },
          ]}
        />
        <TextInput source="destination" label="Destination" />
        <TextInput source="created_at" label="Created At" />
      </SimpleForm>
    </Edit>
  );
}
