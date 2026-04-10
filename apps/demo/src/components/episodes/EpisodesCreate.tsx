import { Create } from "../detail/create";
import { SelectInput } from "../form/select-input";
import { SimpleForm } from "../form/simple-form";
import { TextInput } from "../form/text-input";
import { ReferenceInput } from "../reference/reference-input";

export function EpisodesCreate() {
  return (
    <Create resource="episodes">
      <SimpleForm submitLabel="Create Episode">
        <ReferenceInput
          source="project_id"
          reference="projects"
          optionText="title"
          parse={(v) => (v === "" ? null : Number(v))}
        />
        <ReferenceInput
          source="series_id"
          reference="series"
          optionText="title"
          parse={(v) => (v === "" ? null : Number(v))}
        />
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
