import { Admin } from "@radish-ui/core";
import { Resource } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeDataProvider from "ra-data-fakerest";
import { demoData } from "./data";
import { Layout } from "./components/layout/layout";
import { List } from "./components/list/list";
import { Datagrid } from "./components/list/datagrid";
import { Pagination } from "./components/list/pagination";
import { TextField } from "./components/field/text-field";
import { NumberField } from "./components/field/number-field";
import { EditButton } from "./components/button/edit-button";
import { DeleteButton } from "./components/button/delete-button";
import { CreateButton } from "./components/button/create-button";
import { Show } from "./components/detail/show";
import { SimpleShowLayout } from "./components/detail/simple-show-layout";
import { Edit } from "./components/detail/edit";
import { Create } from "./components/detail/create";
import { SimpleForm } from "./components/form/simple-form";
import { TextInput } from "./components/form/text-input";
import { NumberInput } from "./components/form/number-input";

const dataProvider = fakeDataProvider(demoData);

const i18nProvider = polyglotI18nProvider(() => englishMessages, "en");

function SeriesList() {
  return (
    <List resource="series" actions={<CreateButton />} pagination={<Pagination />}>
      <Datagrid
        rowActions={
          <>
            <EditButton />
            <DeleteButton />
          </>
        }
      >
        <TextField source="id" label="ID" />
        <TextField source="title" label="Title" />
        <TextField source="cadence" label="Cadence" />
        <TextField source="status" label="Status" />
        <NumberField source="owner_id" label="Owner ID" />
      </Datagrid>
    </List>
  );
}

function SeriesShow() {
  return (
    <Show resource="series" actions={<EditButton />}>
      <SimpleShowLayout>
        <TextField source="id" label="ID" />
        <TextField source="title" label="Title" />
        <TextField source="cadence" label="Cadence" />
        <TextField source="status" label="Status" />
        <NumberField source="owner_id" label="Owner ID" />
        <TextField source="created_at" label="Created At" />
      </SimpleShowLayout>
    </Show>
  );
}

function SeriesEdit() {
  return (
    <Edit resource="series">
      <SimpleForm>
        <TextInput source="title" label="Title" />
        <TextInput source="cadence" label="Cadence" />
        <TextInput source="status" label="Status" />
        <NumberInput source="owner_id" label="Owner ID" min={1} />
        <TextInput source="created_at" label="Created At" />
      </SimpleForm>
    </Edit>
  );
}

function SeriesCreate() {
  return (
    <Create resource="series">
      <SimpleForm submitLabel="Create Series">
        <TextInput source="title" label="Title" />
        <TextInput source="cadence" label="Cadence" />
        <TextInput source="status" label="Status" />
        <NumberInput source="owner_id" label="Owner ID" min={1} />
        <TextInput source="created_at" label="Created At" />
      </SimpleForm>
    </Create>
  );
}

export default function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      layout={Layout}
      title="radish-ui demo"
    >
      <Resource
        name="series"
        list={SeriesList}
        show={SeriesShow}
        edit={SeriesEdit}
        create={SeriesCreate}
      />
    </Admin>
  );
}
