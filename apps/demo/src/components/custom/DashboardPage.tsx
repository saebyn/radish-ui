/**
 * DashboardPage — demo-only landing page.
 *
 * Shown when the user navigates to "/" inside the admin.
 * Combines TeamWorkloadCard and ActivityFeed into a two-column layout.
 */

import { ActivityFeed } from "./ActivityFeed";
import { TeamWorkloadCard } from "./TeamWorkloadCard";

export function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-10">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Team workload at a glance and the latest activity across all resources.
        </p>
      </div>

      {/* Two-column layout: workload cards left, activity feed right */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Team workload — spans 2 of 3 columns */}
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
            Team Workload
          </h2>
          <TeamWorkloadCard />
        </section>

        {/* Activity feed — spans 1 of 3 columns */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
            Recent Activity
          </h2>
          <div className="rounded-lg border border-neutral-200 bg-canvas-0 px-5 py-4 shadow-sm dark:border-neutral-700 dark:bg-canvas-800">
            <ActivityFeed perPage={20} />
          </div>
        </section>
      </div>
    </div>
  );
}
