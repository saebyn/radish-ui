import { Admin } from "@radish-ui/core";
import { Resource } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import jsonServerProvider from "ra-data-json-server";
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

const dataProvider = jsonServerProvider("https://jsonplaceholder.typicode.com");

const i18nProvider = polyglotI18nProvider(() => englishMessages, "en");

function PostList() {
  return (
    <List resource="posts" actions={<CreateButton />} pagination={<Pagination />}>
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
        <NumberField source="userId" label="User ID" />
      </Datagrid>
    </List>
  );
}

function PostShow() {
  return (
    <Show resource="posts" actions={<EditButton />}>
      <SimpleShowLayout>
        <TextField source="id" label="ID" />
        <TextField source="title" label="Title" />
        <TextField source="body" label="Body" />
        <NumberField source="userId" label="User ID" />
      </SimpleShowLayout>
    </Show>
  );
}

function PostEdit() {
  return (
    <Edit resource="posts">
      <SimpleForm>
        <TextInput source="title" label="Title" />
        <TextInput source="body" label="Body" multiline rows={5} />
        <NumberInput source="userId" label="User ID" min={1} />
      </SimpleForm>
    </Edit>
  );
}

function PostCreate() {
  return (
    <Create resource="posts">
      <SimpleForm submitLabel="Create Post">
        <TextInput source="title" label="Title" />
        <TextInput source="body" label="Body" multiline rows={5} />
        <NumberInput source="userId" label="User ID" min={1} />
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
      basename="/radish-ui/demo"
    >
      <Resource name="posts" list={PostList} show={PostShow} edit={PostEdit} create={PostCreate} />
    </Admin>
  );
}
