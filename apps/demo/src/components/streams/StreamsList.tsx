import { CreateButton } from "../button/create-button";
import { DeleteButton } from "../button/delete-button";
import { EditButton } from "../button/edit-button";
import { NumberField } from "../field/number-field";
import { TextField } from "../field/text-field";
import { Datagrid } from "../list/datagrid";
import { List } from "../list/list";
import { Pagination } from "../list/pagination";

export function StreamsList() {
  return (
    <List resource="streams" actions={<CreateButton />} pagination={<Pagination />}>
      <Datagrid
        rowActions={
          <>
            <EditButton />
            <DeleteButton />
          </>
        }
      >
        <NumberField source="id" label="ID" />
        <TextField source="title" label="Title" />
        <NumberField source="series_id" label="Series ID" />
        <TextField source="date" label="Date" />
        <TextField source="platform" label="Platform" />
        <NumberField source="duration_seconds" label="Duration (s)" />
        <TextField source="status" label="Status" />
      </Datagrid>
    </List>
  );
}
