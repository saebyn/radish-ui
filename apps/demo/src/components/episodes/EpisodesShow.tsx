/**
 * EpisodesShow — demo-only Show page for episodes.
 *
 * Layout:
 *   - Header: title, publish status badge, Edit + Delete actions
 *   - Left column (2/3): description, metadata (project, series, destination, created)
 *   - Right column (1/3): activity feed filtered to this episode
 */

import { useMemo } from "react";
import { useGetList, useGetOne, useRecordContext, useRedirect } from "ra-core";
import { Show } from "../detail/show";
import { EditButton } from "../button/edit-button";
import { DeleteButton } from "../button/delete-button";
import { UserBadge } from "../custom/UserBadge";
import { ActivityFeed } from "../custom/ActivityFeed";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  ready: "bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300",
  published: "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? STATUS_STYLES.ready;
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}
    >
      {status}
    </span>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface EpisodeRecord {
  id: number;
  title: string;
  description?: string;
  project_id: number;
  series_id: number;
  publish_status: string;
  destination: string;
  created_at: string;
}

interface ProjectRecord {
  id: number;
  title: string;
  status: string;
  owner_id: number;
}

interface SeriesRecord {
  id: number;
  title: string;
}

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
}

// ─── Inner content ────────────────────────────────────────────────────────────

function EpisodeShowContent() {
  const record = useRecordContext<EpisodeRecord>();
  const redirect = useRedirect();

  const { data: project } = useGetOne<ProjectRecord>("projects", {
    id: record?.project_id ?? 0,
  });
  const { data: series } = useGetOne<SeriesRecord>("series", {
    id: record?.series_id ?? 0,
  });
  const { data: users = [] } = useGetList<UserRecord>("users", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "id", order: "ASC" },
  });

  const owner = useMemo(
    () => (project ? users.find((u) => u.id === project.owner_id) : undefined),
    [users, project],
  );

  if (!record) return null;

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
            <MetaRow label="Project">
              {project ? (
                <button
                  className="text-primary-600 hover:underline dark:text-primary-400"
                  onClick={() => redirect("show", "projects", project.id)}
                >
                  {project.title}
                </button>
              ) : (
                `Project #${record.project_id}`
              )}
            </MetaRow>
            <MetaRow label="Series">
              {series ? series.title : `Series #${record.series_id}`}
            </MetaRow>
            <MetaRow label="Destination">
              <span className="font-medium">{record.destination}</span>
            </MetaRow>
            {owner && (
              <MetaRow label="Project Owner">
                <UserBadge name={owner.name} role={owner.role} email={owner.email} />
              </MetaRow>
            )}
            <MetaRow label="Created">
              {new Date(record.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </MetaRow>
          </div>
        </section>

        {/* Publish context */}
        <section className="rounded-lg border border-neutral-200 bg-canvas-0 p-5 shadow-sm dark:border-neutral-700 dark:bg-canvas-800">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Publish Context
          </h2>
          <div className="flex items-center gap-3">
            <StatusBadge status={record.publish_status} />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {record.publish_status === "published"
                ? `Published to ${record.destination}`
                : `Ready to publish to ${record.destination}`}
            </span>
          </div>
        </section>
      </div>

      {/* ── Right: activity feed ── */}
      <div className="lg:col-span-1">
        <div className="rounded-lg border border-neutral-200 bg-canvas-0 p-5 shadow-sm dark:border-neutral-700 dark:bg-canvas-800">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Activity
          </h2>
          <ActivityFeed
            filter={{ resource_type: "episodes", resource_id: record.id }}
            perPage={20}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function EpisodeShowHeader() {
  const record = useRecordContext<EpisodeRecord>();
  if (!record) return null;
  return (
    <div className="flex items-center gap-3">
      <StatusBadge status={record.publish_status} />
      <span className="text-sm text-neutral-500 dark:text-neutral-400">→ {record.destination}</span>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export function EpisodesShow() {
  return (
    <Show
      resource="episodes"
      actions={
        <div className="flex items-center gap-2">
          <EditButton />
          <DeleteButton />
        </div>
      }
    >
      <div className="space-y-4 p-4">
        <EpisodeShowHeader />
        <EpisodeShowContent />
      </div>
    </Show>
  );
}
