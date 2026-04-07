import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

function Introduction() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-12 font-sans">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          🌱 Radish UI
        </h1>
        <p className="text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Tailwind CSS components for{" "}
          <a
            href="https://marmelab.com/react-admin/"
            target="_blank"
            rel="noreferrer"
            className="text-primary-600 dark:text-primary-400 underline underline-offset-2 hover:text-primary-800 dark:hover:text-primary-200"
          >
            react-admin
          </a>
          . Like shadcn/ui, but for react-admin — use <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">ra-core</code> for
          headless state management and own your UI components.
        </p>
      </div>

      <div className="mb-10 p-4 border border-warning-300 bg-warning-50 dark:border-warning-700 dark:bg-warning-950 rounded-lg text-warning-800 dark:text-warning-200 text-sm leading-relaxed">
        ⚠️ <strong>Early development — not production-ready.</strong> Many
        components are missing or incomplete, and the API may change rapidly.
        Use at your own risk.
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
          What is this?
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
          Radish UI takes the same approach as{" "}
          <a
            href="https://ui.shadcn.com/"
            target="_blank"
            rel="noreferrer"
            className="text-primary-600 dark:text-primary-400 underline underline-offset-2 hover:text-primary-800 dark:hover:text-primary-200"
          >
            shadcn/ui
          </a>
          : instead of installing a component library and fighting its styles,
          you copy the components directly into your project and make them your
          own. The difference from plain react-admin:{" "}
          <strong>zero Material UI</strong>. All styling is Tailwind CSS.
        </p>
        <ul className="list-disc list-inside space-y-2 text-neutral-700 dark:text-neutral-300">
          <li>
            <strong>
              <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">@radish-ui/core</code>
            </strong>{" "}
            — Wraps <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">ra-core</code> primitives and provides a{" "}
            <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">cn()</code> utility for Tailwind class merging.
          </li>
          <li>
            <strong>
              <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">@radish-ui/cli</code>
            </strong>{" "}
            — Copies registry components into your project and keeps them in
            sync with upstream changes.
          </li>
          <li>
            <strong>Registry components</strong> — Tailwind-styled components
            you own and can customize freely.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
          What's in this Storybook?
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6">
          Each story demonstrates a component in isolation using mock{" "}
          <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">ra-core</code> providers — no real data source required.
          Use the toolbar above to toggle <strong>dark mode</strong> and explore
          how components adapt.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              category: "Layout",
              description:
                "App shell, sidebar, and menu — the outer frame of your admin.",
            },
            {
              category: "List",
              description:
                "Datagrid, pagination, bulk actions, and export button for resource lists.",
            },
            {
              category: "Detail",
              description:
                "Show, Edit, Create views with simple and tabbed layouts.",
            },
            {
              category: "Form",
              description:
                "SimpleForm with text, number, select, and boolean inputs.",
            },
            {
              category: "Field",
              description:
                "TextField, NumberField, BooleanField, DateField, and more display components.",
            },
            {
              category: "Button",
              description:
                "EditButton, DeleteButton, and CreateButton wired to ra-core navigation.",
            },
            {
              category: "Filter",
              description:
                "SearchInput, FilterButton, and FilterForm for list filtering.",
            },
            {
              category: "Dialog",
              description: "Confirm dialog for destructive actions.",
            },
            {
              category: "Reference",
              description:
                "ReferenceField and ReferenceInput for related-record display and selection.",
            },
            {
              category: "Skeleton",
              description:
                "Loading skeleton placeholders with accessible live-region support.",
            },
            {
              category: "Notification",
              description: "Toast notifications surfaced from ra-core.",
            },
            {
              category: "Error Boundary",
              description:
                "Graceful error UI for unexpected rendering failures.",
            },
          ].map(({ category, description }) => (
            <div
              key={category}
              className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
            >
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                {category}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
          Getting started
        </h2>
        <ol className="list-decimal list-inside space-y-3 text-neutral-700 dark:text-neutral-300">
          <li>
            Install the core package:
            <pre className="mt-2 mb-1 p-3 bg-neutral-100 dark:bg-neutral-800 rounded text-sm font-mono overflow-x-auto">
              pnpm add @radish-ui/core ra-core react react-dom
            </pre>
          </li>
          <li>
            Add components with the CLI:
            <pre className="mt-2 mb-1 p-3 bg-neutral-100 dark:bg-neutral-800 rounded text-sm font-mono overflow-x-auto">
              npx @radish-ui/cli add layout datagrid list text-field
            </pre>
          </li>
          <li>
            Keep components up to date:
            <pre className="mt-2 mb-1 p-3 bg-neutral-100 dark:bg-neutral-800 rounded text-sm font-mono overflow-x-auto">
              npx @radish-ui/cli sync
            </pre>
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
          Learn more
        </h2>
        <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
          <li>
            📖{" "}
            <a
              href="https://saebyn.github.io/radish-ui/"
              target="_blank"
              rel="noreferrer"
              className="text-primary-600 dark:text-primary-400 underline underline-offset-2 hover:text-primary-800 dark:hover:text-primary-200"
            >
              Documentation
            </a>
          </li>
          <li>
            💻{" "}
            <a
              href="https://github.com/saebyn/radish-ui"
              target="_blank"
              rel="noreferrer"
              className="text-primary-600 dark:text-primary-400 underline underline-offset-2 hover:text-primary-800 dark:hover:text-primary-200"
            >
              GitHub repository
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}

const meta: Meta = {
  title: "Introduction",
  component: Introduction,
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    actions: { disable: true },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome: Story = {
  name: "Welcome",
};
