import { CreateButton } from "../button/create-button";
import { DeleteButton } from "../button/delete-button";
import { EditButton } from "../button/edit-button";
import { ShowButton } from "../button/show-button";
import { NumberField } from "../field/number-field";
import { TextField } from "../field/text-field";
import { Datagrid } from "../list/datagrid";
import { List } from "../list/list";
import { Pagination } from "../list/pagination";

export function ProjectsList() {
  return (
    <List resource="projects" actions={<CreateButton />} pagination={<Pagination />}>
      <Datagrid
        rowActions={
          <>
            <ShowButton />
            <EditButton />
            <DeleteButton />
          </>
        }
      >
        <NumberField source="id" label="ID" />
        <TextField source="title" label="Title" />
        <NumberField source="series_id" label="Series ID" />
        <NumberField source="owner_id" label="Owner ID" />
        <TextField source="status" label="Status" />
        <TextField source="streams" label="Stream IDs" />
      </Datagrid>
    </List>
  );
}
