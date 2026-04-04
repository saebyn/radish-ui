import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton, SkeletonContainer } from "./skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  name: "Single block (decorative)",
  render: () => <Skeleton className="h-4 w-48" />,
};

export const WithLabel: Story = {
  name: "With label (status announcement)",
  render: () => <Skeleton label="Loading content…" className="h-4 w-48" />,
};

export const TextLines: Story = {
  name: "Text lines (SkeletonContainer)",
  render: () => (
    <SkeletonContainer label="Loading content…" className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </SkeletonContainer>
  ),
};

export const CardSkeleton: Story = {
  name: "Card",
  render: () => (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  ),
};

export const FormSkeleton: Story = {
  name: "Form",
  render: () => (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
        <Skeleton className="mt-2 h-9 w-28" />
      </div>
    </div>
  ),
};

export const TableSkeleton: Story = {
  name: "Table",
  render: () => (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {["Title", "Author", "Year"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              {[1, 2, 3].map((j) => (
                <td key={j} className="px-4 py-3">
                  <Skeleton className="h-4" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};
