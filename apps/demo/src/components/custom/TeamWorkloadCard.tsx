/**
 * TeamWorkloadCard — demo-only component.
 *
 * Displays a grid of per-user workload cards showing owned projects,
 * assigned reviews, and episodes authored. Fetches its own data.
 *
 * @example
 * <TeamWorkloadCard />
 */

import { useGetList } from "ra-core";
import { UserBadge } from "./UserBadge";

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ProjectRecord {
  id: number;
  owner_id: number;
  reviewer_ids: number[];
}

interface EpisodeRecord {
  id: number;
  project_id: number;
}

interface StatPillProps {
  label: string;
  value: number;
  color: string;
}

function StatPill({ label, value, color }: StatPillProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
    </div>
  );
}

export function TeamWorkloadCard() {
  const { data: users = [], isPending: usersLoading } = useGetList<UserRecord>("users", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "name", order: "ASC" },
  });

  const { data: projects = [] } = useGetList<ProjectRecord>("projects", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "id", order: "ASC" },
  });

  const { data: episodes = [] } = useGetList<EpisodeRecord>("episodes", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "id", order: "ASC" },
  });

  if (usersLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-neutral-200 bg-canvas-0 p-5 dark:border-neutral-700 dark:bg-canvas-800"
          >
            <div className="mb-4 h-7 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="flex justify-around">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex flex-col items-center gap-1">
                  <div className="h-8 w-8 rounded bg-neutral-200 dark:bg-neutral-700" />
                  <div className="h-3 w-12 rounded bg-neutral-200 dark:bg-neutral-700" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Build project-id → episode count map
  const episodesPerProject: Record<number, number> = {};
  for (const ep of episodes) {
    episodesPerProject[ep.project_id] = (episodesPerProject[ep.project_id] ?? 0) + 1;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => {
        const owned = projects.filter((p) => p.owner_id === user.id);
        const reviewing = projects.filter(
          (p) => Array.isArray(p.reviewer_ids) && p.reviewer_ids.includes(user.id),
        );
        const episodeCount = owned.reduce((sum, p) => sum + (episodesPerProject[p.id] ?? 0), 0);

        return (
          <div
            key={user.id}
            className="rounded-lg border border-neutral-200 bg-canvas-0 p-5 shadow-sm dark:border-neutral-700 dark:bg-canvas-800"
          >
            <div className="mb-4">
              <UserBadge name={user.name} role={user.role} email={user.email} />
            </div>

            <div className="flex justify-around border-t border-neutral-100 pt-4 dark:border-neutral-700">
              <StatPill
                label="Owns"
                value={owned.length}
                color="text-primary-600 dark:text-primary-400"
              />
              <StatPill
                label="Reviewing"
                value={reviewing.length}
                color="text-warning-600 dark:text-warning-400"
              />
              <StatPill
                label="Episodes"
                value={episodeCount}
                color="text-success-600 dark:text-success-400"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
