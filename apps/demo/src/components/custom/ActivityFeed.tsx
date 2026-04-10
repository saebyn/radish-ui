/**
 * ActivityFeed — demo-only component.
 *
 * Renders a vertical timeline of activityLog entries. Resolves actor names
 * from the users resource. Can be used standalone (fetches its own data) or
 * embedded in a Show page.
 *
 * @example
 * <ActivityFeed />
 *
 * @example — filter to a specific resource
 * <ActivityFeed filter={{ resource_type: "projects", resource_id: 1 }} />
 */

import { useGetList } from "ra-core";

const ACTION_LABELS: Record<string, string> = {
  project_created: "created project",
  project_status_changed: "changed project status",
  status_transition: "changed status",
  episode_published: "published episode",
};

const ACTION_COLORS: Record<string, string> = {
  project_created: "bg-success-500 dark:bg-success-400",
  project_status_changed: "bg-primary-500 dark:bg-primary-400",
  status_transition: "bg-primary-500 dark:bg-primary-400",
  episode_published: "bg-warning-500 dark:bg-warning-400",
};

function formatTimestamp(ts: string) {
  try {
    const diffMs = Date.now() - new Date(ts).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    const diffMo = Math.floor(diffDay / 30);
    if (diffMo < 12) return `${diffMo}mo ago`;
    return `${Math.floor(diffMo / 12)}y ago`;
  } catch {
    return ts;
  }
}

function formatDetails(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const d = details as Record<string, unknown>;
  if ("from" in d && "to" in d) return `${d.from} → ${d.to}`;
  if ("status" in d) return String(d.status);
  if ("destination" in d) return `to ${d.destination}`;
  return null;
}

interface ActivityLogRecord {
  id: number;
  actor_id: number;
  action: string;
  resource_type: string;
  resource_id: number;
  change_details: unknown;
  timestamp: string;
}

interface UserRecord {
  id: number;
  name: string;
}

interface ActivityFeedProps {
  /** Extra filters forwarded to the activityLog getList call */
  filter?: Record<string, unknown>;
  /** Max entries to show. Default: 50 */
  perPage?: number;
}

export function ActivityFeed({ filter, perPage = 50 }: ActivityFeedProps) {
  const { data: entries = [], isPending: entriesLoading } = useGetList<ActivityLogRecord>(
    "activityLog",
    {
      pagination: { page: 1, perPage },
      sort: { field: "timestamp", order: "DESC" },
      filter,
    },
  );

  const { data: users = [] } = useGetList<UserRecord>("users", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "id", order: "ASC" },
  });

  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

  if (entriesLoading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-600" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-3 w-1/3 rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        No activity yet.
      </p>
    );
  }

  return (
    <ol className="relative border-l border-neutral-200 dark:border-neutral-700 space-y-0">
      {entries.map((entry) => {
        const actorName = userMap[entry.actor_id] ?? `User #${entry.actor_id}`;
        const actionLabel = ACTION_LABELS[entry.action] ?? entry.action.replace(/_/g, " ");
        const dotColor = ACTION_COLORS[entry.action] ?? "bg-neutral-400 dark:bg-neutral-500";
        const detail = formatDetails(entry.change_details);

        return (
          <li key={entry.id} className="mb-6 ml-4">
            {/* Timeline dot */}
            <span
              className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-neutral-900 ${dotColor}`}
              aria-hidden
            />

            <div className="flex flex-col gap-0.5">
              <p className="text-sm text-neutral-900 dark:text-neutral-100">
                <span className="font-medium">{actorName}</span> <span>{actionLabel}</span>
                {detail && (
                  <span className="ml-1 inline-block whitespace-nowrap rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {detail}
                  </span>
                )}
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                {entry.resource_type} #{entry.resource_id} · {formatTimestamp(entry.timestamp)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
