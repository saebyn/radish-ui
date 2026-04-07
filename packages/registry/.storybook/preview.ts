import type { Decorator, Preview } from "@storybook/react";
import React from "react";
import "../src/storybook.css";

/**
 * Global decorator that applies the Tailwind `dark` class to the document root
 * and updates the preview background so all `dark:` variants activate correctly.
 */
const withDarkMode: Decorator = (Story, context) => {
  const isDark = (context.globals as { darkMode?: boolean }).darkMode === true;
  document.documentElement.classList.toggle("dark", isDark);
  document.body.style.backgroundColor = isDark ? "rgb(17 24 39)" : "";
  return React.createElement(Story);
};

const preview: Preview = {
  globalTypes: {
    darkMode: {
      description: "Toggle dark mode",
      toolbar: {
        title: "Dark mode",
        icon: "circlehollow",
        items: [
          { value: false, title: "Light", icon: "sun" },
          { value: true, title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    darkMode: false,
  },
  decorators: [withDarkMode],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ["Introduction", "*"],
      },
    },
  },
};

export default preview;
