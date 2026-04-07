import { CreateButton } from "../button/create-button";
import { DeleteButton } from "../button/delete-button";
import { EditButton } from "../button/edit-button";
import { NumberField } from "../field/number-field";
import { TextField } from "../field/text-field";
import { Datagrid } from "../list/datagrid";
import { List } from "../list/list";
import { Pagination } from "../list/pagination";

export function EpisodesList() {
  return (
    <List resource="episodes" actions={<CreateButton />} pagination={<Pagination />}>
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
        <NumberField source="project_id" label="Project ID" />
        <NumberField source="series_id" label="Series ID" />
        <TextField source="publish_status" label="Publish Status" />
        <TextField source="destination" label="Destination" />
      </Datagrid>
    </List>
  );
}
