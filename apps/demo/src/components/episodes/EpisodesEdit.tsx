import { Edit } from "../detail/edit";
import { SelectInput } from "../form/select-input";
import { SimpleForm } from "../form/simple-form";
import { TextInput } from "../form/text-input";
import { ReferenceInput } from "../reference/reference-input";

export function EpisodesEdit() {
  return (
    <Edit resource="episodes" mutationMode="pessimistic">
      <SimpleForm>
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
    </Edit>
  );
}
