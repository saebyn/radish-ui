import { Edit } from "../detail/edit";
import { NumberInput } from "../form/number-input";
import { SimpleForm } from "../form/simple-form";
import { TextInput } from "../form/text-input";

export function StreamsEdit() {
  return (
    <Edit resource="streams" mutationMode="pessimistic">
      <SimpleForm>
        <NumberInput source="series_id" label="Series ID" min={1} />
        <TextInput source="title" label="Title" />
        <TextInput source="date" label="Date" />
        <TextInput source="platform" label="Platform" />
        <NumberInput source="duration_seconds" label="Duration (seconds)" min={0} />
        <TextInput source="status" label="Status" />
        <TextInput source="created_at" label="Created At" />
      </SimpleForm>
    </Edit>
  );
}
