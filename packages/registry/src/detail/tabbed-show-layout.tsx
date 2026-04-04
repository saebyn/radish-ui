import React, { useState } from "react";
import { cn } from "@radish-ui/core";

interface TabPanelProps {
  /** Tab heading label. */
  label: string;
  /** Tab panel content — field components or any React node. */
  children: React.ReactNode;
  className?: string;
}

/**
 * A single tab panel for use inside `<TabbedShowLayout>`.
 * The `label` prop is used as the tab button text.
 *
 * @example
 * <TabbedShowLayout>
 *   <TabPanel label="Details">…</TabPanel>
 *   <TabPanel label="Relations">…</TabPanel>
 * </TabbedShowLayout>
 */
export function TabPanel({ children, className }: TabPanelProps) {
  return <div className={cn("pt-4", className)}>{children}</div>;
}

interface TabbedShowLayoutProps {
  /** `<TabPanel>` components. */
  children: React.ReactElement<TabPanelProps> | React.ReactElement<TabPanelProps>[];
  className?: string;
}

/**
 * Wraps Show page content in accessible tabs.
 * Each `<TabPanel label="…">` child becomes a tab.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <Show>
 *   <TabbedShowLayout>
 *     <TabPanel label="Details">
 *       <TextField source="title" />
 *     </TabPanel>
 *     <TabPanel label="Relations">
 *       <ReferenceField source="authorId" reference="authors">
 *         <TextField source="name" />
 *       </ReferenceField>
 *     </TabPanel>
 *   </TabbedShowLayout>
 * </Show>
 */
export function TabbedShowLayout({ children, className }: TabbedShowLayoutProps) {
  const tabs = React.Children.toArray(children) as React.ReactElement<TabPanelProps>[];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800",
        className,
      )}
    >
      {/* Tab bar */}
      <div role="tablist" className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab, i) => (
          <button
            key={i}
            role="tab"
            type="button"
            id={`tab-${i}`}
            aria-selected={activeIndex === i}
            aria-controls={`tabpanel-${i}`}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500",
              activeIndex === i
                ? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
            )}
          >
            {tab.props.label}
          </button>
        ))}
      </div>

      {/* Active panel */}
      {tabs.map((tab, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`tabpanel-${i}`}
          aria-labelledby={`tab-${i}`}
          hidden={activeIndex !== i}
          className="px-6 pb-6"
        >
          {tab}
        </div>
      ))}
    </div>
  );
}
