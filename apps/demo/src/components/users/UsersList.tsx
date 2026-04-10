import { CreateButton } from "../button/create-button";
import { DeleteButton } from "../button/delete-button";
import { EditButton } from "../button/edit-button";
import { TextField } from "../field/text-field";
import { Datagrid } from "../list/datagrid";
import { List } from "../list/list";
import { Pagination } from "../list/pagination";
import { UserBadge } from "../custom/UserBadge";

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
        <UserBadge source="name" roleSource="role" label="User" />
        <TextField source="email" label="Email" />
      </Datagrid>
    </List>
  );
}
