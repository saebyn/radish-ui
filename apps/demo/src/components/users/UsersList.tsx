import { CreateButton } from "../button/create-button";
import { DeleteButton } from "../button/delete-button";
import { EditButton } from "../button/edit-button";
import { NumberField } from "../field/number-field";
import { TextField } from "../field/text-field";
import { Datagrid } from "../list/datagrid";
import { List } from "../list/list";
import { Pagination } from "../list/pagination";

export function UsersList() {
  return (
    <List resource="users" actions={<CreateButton />} pagination={<Pagination />}>
      <Datagrid
        rowActions={
          <>
            <EditButton />
            <DeleteButton />
          </>
        }
      >
        <NumberField source="id" label="ID" />
        <TextField source="name" label="Name" />
        <TextField source="email" label="Email" />
        <TextField source="role" label="Role" />
      </Datagrid>
    </List>
  );
}
