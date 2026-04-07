import { useMemo } from "react";
import { useGetList } from "ra-core";
import { Create } from "../detail/create";
import { MultiSelectInput } from "../form/multi-select-input";
import { NumberInput } from "../form/number-input";
import { SelectInput } from "../form/select-input";
import { SimpleForm } from "../form/simple-form";
import { TextInput } from "../form/text-input";

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
      <SimpleForm submitLabel="Create Project">
        <TextInput source="title" label="Title" />
        <TextInput source="description" label="Description" multiline rows={4} />
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
        <MultiSelectInput source="streams" label="Source Streams" choices={streamChoices} />
        <TextInput source="created_at" label="Created At" />
      </SimpleForm>
    </Create>
  );
}
