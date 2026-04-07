import { Edit } from "../detail/edit";
import { SelectInput } from "../form/select-input";
import { SimpleForm } from "../form/simple-form";
import { TextInput } from "../form/text-input";

export function UsersEdit() {
  return (
    <Edit resource="users">
      <SimpleForm>
        <TextInput source="name" label="Name" />
        <TextInput source="email" label="Email" />
        <SelectInput
          source="role"
          label="Role"
          choices={[
            { id: "editor", name: "Editor" },
            { id: "reviewer", name: "Reviewer" },
            { id: "admin", name: "Admin" },
          ]}
        />
        <TextInput source="created_at" label="Created At" />
      </SimpleForm>
    </Edit>
  );
}
