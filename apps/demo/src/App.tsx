import { Admin, ListBase } from "@radish-ui/core";
import { Resource } from "ra-core";
import jsonServerProvider from "ra-data-json-server";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { Layout } from "./components/layout/layout";
import { ListView } from "./components/list/list-view";
import { Datagrid } from "./components/list/datagrid";
import { TextField } from "./components/field/text-field";

const dataProvider = jsonServerProvider("https://jsonplaceholder.typicode.com");

const i18nProvider = polyglotI18nProvider(() => englishMessages, "en");

function PostList() {
  return (
    <ListBase resource="posts">
      <ListView>
        <Datagrid>
          <TextField source="id" label="ID" />
          <TextField source="title" label="Title" />
          <TextField source="body" label="Body" />
          <TextField source="userId" label="User ID" />
        </Datagrid>
      </ListView>
    </ListBase>
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
      <Resource name="posts" list={PostList} />
    </Admin>
  );
}
