import { ActivityFeed } from "../custom/ActivityFeed";

export function ActivityLogList() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        Activity Log
      </h1>
      <ActivityFeed />
    </div>
  );
}
