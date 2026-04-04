import type { ReactNode } from "react";
import { cn } from "@radish-ui/core";

interface SkeletonProps {
  /**
   * Accessible label for the loading state.
   * When provided, the block becomes a `role="status"` live region that
   * announces the loading state to screen readers and is no longer hidden
   * from the accessibility tree.
   * Omit for purely decorative skeleton blocks that are part of a larger
   * loading region (e.g. individual rows inside a `SkeletonContainer`).
   *
   * @example
   * // Status-announcing skeleton (use once per loading region)
   * <Skeleton label="Loading posts…" className="h-4 w-48" />
   *
   * // Decorative skeleton (aria-hidden, no announcement)
   * <Skeleton className="h-4 w-48" />
   */
  label?: string;
  className?: string;
}

/**
 * Base skeleton block with a pulsing animation.
 * Compose multiples of these to build custom loading states.
 *
 * When a `label` prop is supplied the block renders as a `role="status"`
 * live region so screen readers announce the loading state. Without a
 * label the block is hidden from the accessibility tree (`aria-hidden`)
 * and acts as a purely decorative placeholder.
 *
 * For loading states that contain many skeleton blocks, prefer wrapping
 * them in a `SkeletonContainer` instead of labelling each block.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * // Announce loading to screen readers (one per loading region)
 * <Skeleton label="Loading…" className="h-4 w-48" />
 *
 * // Decorative placeholder (inside a SkeletonContainer)
 * <Skeleton className="h-4 w-48" />
 *
 * // An avatar placeholder
 * <Skeleton className="h-10 w-10 rounded-full" />
 */
export function Skeleton({ label, className }: SkeletonProps) {
  if (label) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn("animate-pulse rounded-md bg-gray-200", className)}
      >
        <span className="sr-only">{label}</span>
      </div>
    );
  }
  return (
    <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-gray-200", className)} />
  );
}

interface SkeletonContainerProps {
  /** Accessible label announced to screen readers when the loading state mounts. */
  label: string;
  className?: string;
  children: ReactNode;
}

/**
 * Wrapper for composite skeleton loading states.
 * Renders a single `role="status"` live region with `aria-busy` so all
 * the decorative skeleton blocks inside it are announced by one label —
 * no need to label every individual block.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <SkeletonContainer label="Loading posts…" className="space-y-2">
 *   <Skeleton className="h-4 w-full" />
 *   <Skeleton className="h-4 w-3/4" />
 * </SkeletonContainer>
 */
export function SkeletonContainer({ label, className, children }: SkeletonContainerProps) {
  return (
    <div aria-busy="true" aria-label={label} className={className}>
      {children}
    </div>
  );
}
