import { defineConfig } from "vitepress";

export default defineConfig({
  title: "radish-ui",
  description: "Tailwind CSS components for react-admin",
  base: "/radish-ui/",
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Components", link: "/guide/components" },
      { text: "CLI", link: "/guide/cli" },
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
