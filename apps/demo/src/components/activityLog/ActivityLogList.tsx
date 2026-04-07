import { NumberField } from "../field/number-field";
import { TextField } from "../field/text-field";
import { Datagrid } from "../list/datagrid";
import { List } from "../list/list";
import { Pagination } from "../list/pagination";

export function ActivityLogList() {
  return (
    <List resource="activityLog" pagination={<Pagination />}>
      <Datagrid>
        <NumberField source="id" label="ID" />
        <NumberField source="actor_id" label="Actor ID" />
        <TextField source="action" label="Action" />
        <TextField source="resource_type" label="Resource" />
        <NumberField source="resource_id" label="Resource ID" />
        <TextField source="timestamp" label="Timestamp" />
      </Datagrid>
    </List>
  );
}
