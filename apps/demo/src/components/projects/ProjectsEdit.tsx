import { useMemo } from "react";
import { useGetList } from "ra-core";
import { Edit } from "../detail/edit";
import { SelectArrayInput } from "../form/select-array-input";
import { NumberInput } from "../form/number-input";
import { SelectInput } from "../form/select-input";
import { SimpleForm } from "../form/simple-form";
import { TextInput } from "../form/text-input";

export function ProjectsEdit() {
  const { data: streams = [] } = useGetList("streams", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "id", order: "ASC" },
  });
  const { data: users = [] } = useGetList("users", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "id", order: "ASC" },
  });

  const streamChoices = useMemo(
    () => streams.map((stream) => ({ id: stream.id, name: String(stream.title ?? stream.id) })),
    [streams],
  );
  const reviewerChoices = useMemo(
    () => users.map((user) => ({ id: user.id, name: String(user.name ?? user.id) })),
    [users],
  );

  return (
    <Edit resource="projects" mutationMode="pessimistic">
      <SimpleForm>
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
        <SelectArrayInput source="streams" label="Source Streams" choices={streamChoices} />
        <SelectArrayInput source="reviewer_ids" label="Reviewers" choices={reviewerChoices} />
        <TextInput source="created_at" label="Created At" />
      </SimpleForm>
    </Edit>
  );
}
