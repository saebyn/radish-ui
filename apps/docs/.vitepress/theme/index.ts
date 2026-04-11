import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import NextBanner from "./NextBanner.vue";

export default {
  ...DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "layout-top": () => h(NextBanner),
    });
  },
};
