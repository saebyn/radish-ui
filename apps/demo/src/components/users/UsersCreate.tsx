import { Create } from "../detail/create";
import { SelectInput } from "../form/select-input";
import { SimpleForm } from "../form/simple-form";
import { TextInput } from "../form/text-input";

export function UsersCreate() {
  return (
    <Create resource="users">
      <SimpleForm submitLabel="Create User">
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
    </Create>
  );
}
