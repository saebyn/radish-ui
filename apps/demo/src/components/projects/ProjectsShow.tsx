/**
 * ProjectsShow — demo-only Show page for projects.
 *
 * Layout:
 *   - Header: title, status badge, Edit + Delete actions
 *   - Left column (2/3): description, metadata (series, owner, streams),
 *     reviewers list, related episodes table
 *   - Right column (1/3): activity feed filtered to this project
 */

import { useMemo } from "react";
import { useGetList, useRecordContext, useRedirect } from "ra-core";
import { Show } from "../detail/show";
import { EditButton } from "../button/edit-button";
import { DeleteButton } from "../button/delete-button";
import { UserBadge } from "../custom/UserBadge";
import { ActivityFeed } from "../custom/ActivityFeed";
import { ApprovalWorkflow, type TransitionMap } from "../custom/ApprovalWorkflow";

// ─── Project status workflow ──────────────────────────────────────────────────

const PROJECT_STATUS_TRANSITIONS: TransitionMap = {
  draft: [
    {
      to: "in_review",
      label: "Submit for Review",
      confirmLabel: "Submit",
      prompt: "This will move the project to In Review and notify reviewers.",
      variant: "primary",
    },
  ],
  in_review: [
    {
      to: "published",
      label: "Approve & Publish",
      confirmLabel: "Approve",
      prompt:
        "This will mark the project as Published. This action should only be taken once all episodes are ready.",
      variant: "success",
    },
    {
      to: "draft",
      label: "Reject",
      confirmLabel: "Reject",
      prompt:
        "This will send the project back to Draft. Add a note to explain what needs to change.",
      variant: "danger",
    },
  ],
};

// ─── Status badge ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  in_review: "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300",
  published: "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  const label = status.replace(/_/g, " ");
  return (
    <span
      data-testid="project-status-badge"
      data-status={status}
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}
    >
      {label}
    </span>
  );
}

// ─── Inner content (needs record context) ────────────────────────────────────

interface ProjectRecord {
  id: number;
  title: string;
  description?: string;
  series_id: number;
  owner_id: number;
  streams: number[];
  reviewer_ids: number[];
  status: string;
  created_at: string;
}

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface StreamRecord {
  id: number;
  title: string;
  platform: string;
  date: string;
}

interface SeriesRecord {
  id: number;
  title: string;
}

interface EpisodeRecord {
  id: number;
  title: string;
  publish_status: string;
  destination: string;
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-28 shrink-0 font-medium text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <span className="text-neutral-900 dark:text-neutral-100">{children}</span>
    </div>
  );
}

const EPISODE_STATUS_STYLES: Record<string, string> = {
  ready: "bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300",
  published: "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300",
};

function ProjectShowContent() {
  const record = useRecordContext<ProjectRecord>();
  const redirect = useRedirect();

  const { data: users = [] } = useGetList<UserRecord>("users", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "id", order: "ASC" },
  });
  const { data: streams = [] } = useGetList<StreamRecord>("streams", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "id", order: "ASC" },
  });
  const { data: allSeries = [] } = useGetList<SeriesRecord>("series", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "id", order: "ASC" },
  });
  const { data: episodes = [], isPending: episodesLoading } = useGetList<EpisodeRecord>(
    "episodes",
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "id", order: "ASC" },
      filter: { project_id: record?.id },
    },
  );

  const userMap = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);
  const streamMap = useMemo(() => Object.fromEntries(streams.map((s) => [s.id, s])), [streams]);
  const seriesMap = useMemo(
    () => Object.fromEntries(allSeries.map((s) => [s.id, s.title])),
    [allSeries],
  );

  if (!record) return null;

  const owner = userMap[record.owner_id];
  const seriesTitle = seriesMap[record.series_id] ?? `Series #${record.series_id}`;
  const linkedStreams = (record.streams ?? []).map(
    (id) => streamMap[id] ?? { id, title: `Stream #${id}`, platform: "", date: "" },
  );
  const reviewers = (record.reviewer_ids ?? []).map((id) => userMap[id]).filter(Boolean);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* ── Left: main content ── */}
      <div className="space-y-6 lg:col-span-2">
        {/* Description */}
        {record.description && (
          <section className="rounded-lg border border-neutral-200 bg-canvas-0 p-5 shadow-sm dark:border-neutral-700 dark:bg-canvas-800">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Description
            </h2>
            <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {record.description}
            </p>
          </section>
        )}

        {/* Metadata */}
        <section className="rounded-lg border border-neutral-200 bg-canvas-0 p-5 shadow-sm dark:border-neutral-700 dark:bg-canvas-800">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Details
          </h2>
          <div className="space-y-2">
            <MetaRow label="Series">{seriesTitle}</MetaRow>
            <MetaRow label="Owner">
              {owner ? (
                <UserBadge name={owner.name} role={owner.role} email={owner.email} />
              ) : (
                `User #${record.owner_id}`
              )}
            </MetaRow>
            <MetaRow label="Created">
              {new Date(record.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </MetaRow>
            <MetaRow label="Source Streams">
              {linkedStreams.length === 0 ? (
                <span className="italic text-neutral-400">None</span>
              ) : (
                <ul className="space-y-0.5">
                  {linkedStreams.map((s) => (
                    <li key={s.id}>
                      {s.title}
                      {s.platform && (
                        <span className="ml-1.5 text-neutral-400">({s.platform})</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </MetaRow>
          </div>
        </section>

        {/* Reviewers */}
        {reviewers.length > 0 && (
          <section className="rounded-lg border border-neutral-200 bg-canvas-0 p-5 shadow-sm dark:border-neutral-700 dark:bg-canvas-800">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Reviewers
            </h2>
            <div className="flex flex-wrap gap-3">
              {reviewers.map((u) => (
                <UserBadge key={u!.id} name={u!.name} role={u!.role} email={u!.email} />
              ))}
            </div>
          </section>
        )}

        {/* Episodes */}
        <section className="rounded-lg border border-neutral-200 bg-canvas-0 shadow-sm dark:border-neutral-700 dark:bg-canvas-800">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3 dark:border-neutral-700">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Episodes
            </h2>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {episodes.length}
            </span>
          </div>
          {episodesLoading ? (
            <div className="space-y-2 p-5">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-8 animate-pulse rounded bg-neutral-100 dark:bg-neutral-700"
                />
              ))}
            </div>
          ) : episodes.length === 0 ? (
            <p className="p-5 text-sm italic text-neutral-400">No episodes yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left text-xs font-medium uppercase text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                  <th className="px-5 py-2">Title</th>
                  <th className="px-5 py-2">Status</th>
                  <th className="px-5 py-2">Destination</th>
                  <th className="px-5 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                {episodes.map((ep) => {
                  const epCls =
                    EPISODE_STATUS_STYLES[ep.publish_status] ?? EPISODE_STATUS_STYLES.ready;
                  return (
                    <tr
                      key={ep.id}
                      className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                      onClick={() => redirect("show", "episodes", ep.id)}
                    >
                      <td className="px-5 py-2.5 font-medium text-neutral-900 dark:text-neutral-100">
                        {ep.title}
                      </td>
                      <td className="px-5 py-2.5">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${epCls}`}
                        >
                          {ep.publish_status}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-neutral-600 dark:text-neutral-400">
                        {ep.destination}
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <button
                          className="text-xs text-primary-600 hover:underline dark:text-primary-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            redirect("show", "episodes", ep.id);
                          }}
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {/* ── Right: activity feed ── */}
      <div className="lg:col-span-1">
        <div className="rounded-lg border border-neutral-200 bg-canvas-0 p-5 shadow-sm dark:border-neutral-700 dark:bg-canvas-800">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Activity
          </h2>
          <ActivityFeed
            filter={{ resource_type: "projects", resource_id: record.id }}
            perPage={20}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

function ProjectShowHeader() {
  const record = useRecordContext<ProjectRecord>();
  if (!record) return null;
  return (
    <div className="flex items-center gap-3">
      <StatusBadge status={record.status} />
    </div>
  );
}

export function ProjectsShow() {
  return (
    <Show
      resource="projects"
      actions={
        <div className="flex items-center gap-2">
          <ApprovalWorkflow resource="projects" transitions={PROJECT_STATUS_TRANSITIONS} />
          <EditButton />
          <DeleteButton />
        </div>
      }
    >
      <div className="space-y-4 p-4">
        <ProjectShowHeader />
        <ProjectShowContent />
      </div>
    </Show>
  );
}
