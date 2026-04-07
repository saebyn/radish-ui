import { defineConfig } from "vitepress";

export default defineConfig({
  title: "radish-ui",
  description: "Tailwind CSS components for react-admin",
  base: "/radish-ui/",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Components", link: "/guide/components" },
      { text: "CLI", link: "/guide/cli" },
      { text: "Demo", link: "/demo/", target: "_self" },
      { text: "Storybook", link: "/storybook/", target: "_self" },
      {
        text: "GitHub",
        link: "https://github.com/saebyn/radish-ui",
      },
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [{ text: "Getting Started", link: "/guide/getting-started" }],
      },
      {
        text: "Reference",
        items: [
          { text: "CLI Reference", link: "/guide/cli" },
          { text: "Available Components", link: "/guide/components" },
          { text: "Configuration", link: "/guide/configuration" },
          { text: "Tailwind Preset", link: "/guide/tailwind-preset" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/saebyn/radish-ui" }],
    footer: {
      message: "Released under the MIT License.",
    },
    search: {
      provider: "local",
    },
  },
});
