/**
 * UserBadge — demo-only component.
 *
 * Displays a user's avatar (Gravatar when email is available, initials
 * fallback), name, and role as a compact inline badge.
 *
 * Usage as a standalone component:
 *   <UserBadge name="Alex Rivera" role="editor" email="alex@example.com" />
 *
 * Usage as a field (reads from record context):
 *   <UserBadge source="name" roleSource="role" emailSource="email" label="User" />
 */

import { useRecordContext } from "ra-core";
import md5 from "../../md5";

function gravatarUrl(email: string, size = 28) {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size * 2}&d=404`;
}

// ---------------------------------------------------------------------------

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300",
  reviewer: "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300",
  editor: "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300",
};

const AVATAR_COLORS = [
  "bg-primary-500",
  "bg-success-500",
  "bg-warning-500",
  "bg-danger-500",
  "bg-purple-500",
  "bg-pink-500",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

interface UserBadgeProps {
  /** Explicit name. Takes priority over record context. */
  name?: string;
  /** Explicit role. Takes priority over record context. */
  role?: string;
  /** Explicit email for Gravatar. Takes priority over record context. */
  email?: string;
  /** Record field to read the name from. Default: "name" */
  source?: string;
  /** Record field to read the role from. Default: "role" */
  roleSource?: string;
  /** Record field to read the email from. Default: "email" */
  emailSource?: string;
  /** Used by Datagrid column headers. */
  label?: string;
}

export function UserBadge({
  name: nameProp,
  role: roleProp,
  email: emailProp,
  source = "name",
  roleSource = "role",
  emailSource = "email",
}: UserBadgeProps) {
  const record = useRecordContext();

  const name = nameProp ?? (record ? String(record[source] ?? "") : "");
  const role = roleProp ?? (record ? String(record[roleSource] ?? "") : "");
  const email = emailProp ?? (record ? String(record[emailSource] ?? "") : "");

  if (!name) return null;

  const roleStyle =
    ROLE_STYLES[role.toLowerCase()] ??
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";

  return (
    <span className="inline-flex items-center gap-2">
      <Avatar name={name} email={email} />

      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{name}</span>

      {role && (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${roleStyle}`}>
          {role}
        </span>
      )}
    </span>
  );
}

function Avatar({ name, email }: { name: string; email: string }) {
  const baseClass =
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold";

  const fallback = (
    <span className={`${baseClass} text-white ${avatarColor(name)}`} aria-hidden>
      {initials(name)}
    </span>
  );

  if (!email) return fallback;

  return (
    <>
      <img
        src={gravatarUrl(email, 28)}
        width={28}
        height={28}
        alt=""
        aria-hidden
        className={`${baseClass} object-cover`}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const next = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (next) next.style.display = "inline-flex";
        }}
      />
      <span
        className={`${baseClass} text-white ${avatarColor(name)}`}
        style={{ display: "none" }}
        aria-hidden
      >
        {initials(name)}
      </span>
    </>
  );
}
