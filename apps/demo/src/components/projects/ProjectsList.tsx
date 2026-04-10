import { useState } from "react";
import { CreateButton } from "../button/create-button";
import { DeleteButton } from "../button/delete-button";
import { EditButton } from "../button/edit-button";
import { ShowButton } from "../button/show-button";
import { NumberField } from "../field/number-field";
import { TextField } from "../field/text-field";
import { Datagrid } from "../list/datagrid";
import { List } from "../list/list";
import { Pagination } from "../list/pagination";
import { ProjectKanban } from "../custom/ProjectKanban";
import { ProjectTimeline } from "../custom/ProjectTimeline";

type ViewMode = "list" | "board" | "timeline";

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="flex items-center rounded-md border border-neutral-200 dark:border-neutral-700 overflow-hidden text-sm">
      <button
        onClick={() => onChange("list")}
        className={`px-3 py-1.5 transition-colors ${
          view === "list"
            ? "bg-primary-600 text-white"
            : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
        }`}
      >
        List
      </button>
      <button
        onClick={() => onChange("board")}
        className={`px-3 py-1.5 transition-colors ${
          view === "board"
            ? "bg-primary-600 text-white"
            : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
        }`}
      >
        Board
      </button>
      <button
        onClick={() => onChange("timeline")}
        className={`px-3 py-1.5 transition-colors ${
          view === "timeline"
            ? "bg-primary-600 text-white"
            : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
        }`}
      >
        Timeline
      </button>
    </div>
  );
}

export function ProjectsList() {
  const [view, setView] = useState<ViewMode>("list");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end px-4 pt-4">
        <ViewToggle view={view} onChange={setView} />
      </div>

      {view === "board" ? (
        <div className="px-4 pb-4">
          <ProjectKanban />
        </div>
      ) : view === "timeline" ? (
        <div className="px-4 pb-4">
          <ProjectTimeline />
        </div>
      ) : (
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
      )}
    </div>
  );
}
