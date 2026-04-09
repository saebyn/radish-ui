/**
 * ProjectKanban — Drag-and-drop Kanban board for projects by status.
 *
 * Features:
 * - Three columns: Draft → In Review → Published
 * - Drag projects between columns to change status (powered by @dnd-kit/core)
 * - Visual cards with title, description, owner badge, and stream count
 * - Pessimistic status updates
 */

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useGetList, useUpdate, useCreatePath } from "ra-core";
import { Link } from "react-router-dom";
import { UserBadge } from "./UserBadge";
import { cn } from "@radish-ui/core";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Project {
  id: number;
  title: string;
  description?: string;
  owner_id: number;
  streams: number[];
  status: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface KanbanColumnDef {
  status: string;
  label: string;
  headerColor: string;
  bodyColor: string;
}

// ─── Column config ──────────────────────────────────────────────────────────

const COLUMNS: KanbanColumnDef[] = [
  {
    status: "draft",
    label: "Draft",
    headerColor: "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200",
    bodyColor: "bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-700",
  },
  {
    status: "in_review",
    label: "In Review",
    headerColor: "bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-200",
    bodyColor: "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700",
  },
  {
    status: "published",
    label: "Published",
    headerColor: "bg-success-100 dark:bg-success-900/60 text-success-700 dark:text-success-200",
    bodyColor: "bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-700",
  },
];

// ─── Project Card (draggable) ────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
  owner?: User;
  /** When true, renders as a static ghost clone inside DragOverlay */
  overlay?: boolean;
}

function ProjectCard({ project, owner, overlay = false }: ProjectCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
  });
  const createPath = useCreatePath();
  const showPath = createPath({ resource: "projects", type: "show", id: project.id });

  const style = overlay
    ? {}
    : {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.35 : undefined,
      };

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...(overlay ? {} : { ...listeners, ...attributes })}
      data-testid={overlay ? undefined : `kanban-card-${project.id}`}
      className={cn(
        "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3",
        "hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all",
        overlay ? "shadow-xl rotate-1 cursor-grabbing" : "cursor-grab active:cursor-grabbing",
      )}
    >
      {/* Title — stops pointer-down from reaching the drag listeners */}
      <Link
        to={showPath}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="block font-semibold text-sm text-primary-700 dark:text-primary-400 hover:underline line-clamp-2 leading-snug mb-2"
      >
        {project.title}
      </Link>

      {project.description && (
        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
          {project.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 text-xs">
        {owner && <UserBadge name={owner.name} email={owner.email} role={owner.role} />}
        {project.streams && project.streams.length > 0 && (
          <span className="shrink-0 text-neutral-500 dark:text-neutral-400">
            {project.streams.length} stream
            {project.streams.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Kanban Column (droppable) ───────────────────────────────────────────────

interface KanbanColumnProps {
  column: KanbanColumnDef;
  projects: Project[];
  users: Record<number, User>;
}

function KanbanColumn({ column, projects, users }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status });
  const columnProjects = projects.filter((p) => p.status === column.status);

  return (
    <div
      className="flex flex-col flex-1 min-w-56 gap-0"
      data-testid={`kanban-column-${column.status}`}
    >
      {/* Column header */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-t-lg font-semibold text-sm",
          column.headerColor,
        )}
      >
        <span>{column.label}</span>
        <span className="text-xs font-normal opacity-70">{columnProjects.length}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-3 p-3 rounded-b-lg border-2 min-h-96 transition-colors",
          column.bodyColor,
          isOver &&
            "ring-2 ring-primary-400 ring-offset-1 dark:ring-offset-neutral-950 border-primary-400",
        )}
      >
        {columnProjects.length === 0 ? (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 italic mt-2">
            Drop projects here
          </p>
        ) : (
          columnProjects.map((project) => (
            <ProjectCard key={project.id} project={project} owner={users[project.owner_id]} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Kanban Component ──────────────────────────────────────────────────

export function ProjectKanban() {
  const { data: projects = [], isLoading: projectsLoading } = useGetList<Project>("projects", {
    pagination: { page: 1, perPage: 100 },
  });
  const { data: users = [], isLoading: usersLoading } = useGetList<User>("users", {
    pagination: { page: 1, perPage: 100 },
  });
  const [update] = useUpdate();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const userMap = users.reduce<Record<number, User>>((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});

  function handleDragStart(event: DragStartEvent) {
    const project = projects.find((p) => p.id === event.active.id) ?? null;
    setActiveProject(project);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const targetStatus = String(over.id);
    const projectToMove = projects.find((p) => p.id === active.id);

    if (!projectToMove || projectToMove.status === targetStatus) return;

    setIsUpdating(true);
    try {
      await update(
        "projects",
        {
          id: projectToMove.id,
          data: { ...projectToMove, status: targetStatus },
          previousData: projectToMove,
        },
        { mutationMode: "pessimistic" },
      );
    } catch (err) {
      console.error("Failed to update project status:", err);
    } finally {
      setIsUpdating(false);
    }
  }

  const isLoading = projectsLoading || usersLoading || isUpdating;

  return (
    <div className={cn("w-full", isLoading && "opacity-75 pointer-events-none")}>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 items-start">
          {COLUMNS.map((column) => (
            <KanbanColumn key={column.status} column={column} projects={projects} users={userMap} />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
          {activeProject ? (
            <ProjectCard project={activeProject} owner={userMap[activeProject.owner_id]} overlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
