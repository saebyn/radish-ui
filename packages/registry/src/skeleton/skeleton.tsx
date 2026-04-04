import { cn } from "@radish-ui/core";

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton block with a pulsing animation.
 * Compose multiples of these to build custom loading states.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * // A text-line placeholder
 * <Skeleton className="h-4 w-48" />
 *
 * // An avatar placeholder
 * <Skeleton className="h-10 w-10 rounded-full" />
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-gray-200", className)} />
  );
}
