import { Create } from "../detail/create";
import { NumberInput } from "../form/number-input";
import { SelectInput } from "../form/select-input";
import { SimpleForm } from "../form/simple-form";
import { TextInput } from "../form/text-input";

export function EpisodesCreate() {
  return (
    <Create resource="episodes">
      <SimpleForm submitLabel="Create Episode">
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
    </Create>
  );
}
