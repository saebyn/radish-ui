/**
 * ProjectTimeline — vertical timeline view for projects.
 *
 * Features:
 * - Groups projects by month/year based on `created_at`
 * - Status filter chips (all / draft / in_review / published)
 * - Sort toggle (newest / oldest)
 * - Clickable project titles linking to show pages
 */

import { useMemo, useState } from "react";
import { useGetList, useCreatePath } from "ra-core";
import { Link } from "react-router-dom";
import { cn } from "@radish-ui/core";
import { UserBadge } from "./UserBadge";

interface Project {
  id: number;
  title: string;
  description?: string;
  owner_id: number;
  status: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

type TimelineSort = "newest" | "oldest";
type TimelineStatus = "all" | "draft" | "in_review" | "published";

const STATUS_DOT: Record<string, string> = {
  draft: "bg-neutral-400",
  in_review: "bg-primary-500",
  published: "bg-success-500",
};

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  in_review: "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300",
  published: "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300",
};

function monthKey(dateIso: string) {
  const date = new Date(dateIso);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(dateIso: string) {
  const date = new Date(dateIso);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function ProjectTimeline() {
  const { data: projects = [], isLoading: projectsLoading } = useGetList<Project>("projects", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "created_at", order: "DESC" },
  });
  const { data: users = [], isLoading: usersLoading } = useGetList<User>("users", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "id", order: "ASC" },
  });

  const [statusFilter, setStatusFilter] = useState<TimelineStatus>("all");
  const [sort, setSort] = useState<TimelineSort>("newest");
  const createPath = useCreatePath();

  const userMap = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])) as Record<number, User>,
    [users],
  );

  const filtered = useMemo(() => {
    const next = projects.filter((project) =>
      statusFilter === "all" ? true : project.status === statusFilter,
    );

    next.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sort === "newest" ? timeB - timeA : timeA - timeB;
    });

    return next;
  }, [projects, sort, statusFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; items: Project[] }>();

    for (const project of filtered) {
      const key = monthKey(project.created_at);
      const label = monthLabel(project.created_at);
      const current = map.get(key);
      if (!current) {
        map.set(key, { label, items: [project] });
      } else {
        current.items.push(project);
      }
    }

    return Array.from(map.entries()).map(([key, value]) => ({
      key,
      label: value.label,
      items: value.items,
    }));
  }, [filtered]);

  const isLoading = projectsLoading || usersLoading;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-canvas-0 p-3 dark:border-neutral-700 dark:bg-canvas-800">
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "draft", "in_review", "published"] as TimelineStatus[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              data-testid={`timeline-filter-${value}`}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                statusFilter === value
                  ? "bg-primary-600 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600",
              )}
            >
              {value.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Sort</span>
          <button
            type="button"
            onClick={() => setSort((current) => (current === "newest" ? "oldest" : "newest"))}
            data-testid="timeline-sort-toggle"
            className="rounded-md border border-neutral-200 bg-canvas-0 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-canvas-800 dark:text-neutral-200 dark:hover:bg-canvas-700"
          >
            {sort === "newest" ? "Newest first" : "Oldest first"}
          </button>
        </div>
      </div>

      <div className={cn("space-y-5", isLoading && "opacity-60")}>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="h-20 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800"
              />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm italic text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            No projects match the current filters.
          </div>
        ) : (
          grouped.map((group) => (
            <section key={group.key} className="space-y-3">
              <h3 className="pl-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {group.label}
              </h3>

              <div className="relative space-y-3 pl-4">
                <span
                  aria-hidden="true"
                  className="absolute left-2.5 top-2 bottom-2 w-px bg-neutral-400 dark:bg-neutral-500"
                />
                {group.items.map((project) => {
                  const owner = userMap[project.owner_id];
                  const to = createPath({ resource: "projects", type: "show", id: project.id });

                  return (
                    <article
                      key={project.id}
                      data-testid={`timeline-item-${project.id}`}
                      className="relative ml-2 rounded-lg border border-neutral-200 bg-canvas-0 p-4 pl-8 shadow-sm dark:border-neutral-700 dark:bg-canvas-800"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute -left-5 top-5.5 h-3 w-3 rounded-full border-2 border-canvas-0 dark:border-canvas-900",
                          STATUS_DOT[project.status] ?? STATUS_DOT.draft,
                        )}
                      />

                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <Link
                            to={to}
                            data-testid={`timeline-link-${project.id}`}
                            className="block truncate text-sm font-semibold text-primary-700 hover:underline dark:text-primary-400"
                          >
                            {project.title}
                          </Link>
                          {project.description && (
                            <p className="line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">
                              {project.description}
                            </p>
                          )}
                        </div>

                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                            STATUS_BADGE[project.status] ?? STATUS_BADGE.draft,
                          )}
                        >
                          {project.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                        {owner ? (
                          <UserBadge name={owner.name} role={owner.role} email={owner.email} />
                        ) : (
                          <span>Owner #{project.owner_id}</span>
                        )}

                        <span>
                          {new Date(project.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
