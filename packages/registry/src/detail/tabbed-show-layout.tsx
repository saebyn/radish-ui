import React, { useId, useRef, useState } from "react";
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
  const uid = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabId = (i: number) => `${uid}-tab-${i}`;
  const panelId = (i: number) => `${uid}-panel-${i}`;

  const activateTab = (index: number) => {
    setActiveIndex(index);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (tabs.length === 0) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      activateTab((activeIndex + 1) % tabs.length);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      activateTab((activeIndex - 1 + tabs.length) % tabs.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      activateTab(0);
    } else if (e.key === "End") {
      e.preventDefault();
      activateTab(tabs.length - 1);
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800",
        className,
      )}
    >
      {/* Tab bar */}
      <div
        role="tablist"
        className="flex border-b border-neutral-200 dark:border-neutral-700"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab, i) => (
          <button
            key={i}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={tabId(i)}
            aria-selected={activeIndex === i}
            aria-controls={panelId(i)}
            tabIndex={activeIndex === i ? 0 : -1}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500",
              activeIndex === i
                ? "border-b-2 border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200",
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
          id={panelId(i)}
          aria-labelledby={tabId(i)}
          hidden={activeIndex !== i}
          className="px-6 pb-6"
        >
          {tab}
        </div>
      ))}
    </div>
  );
}
