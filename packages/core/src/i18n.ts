/**
 * Default English message bundle for the `radish.*` i18n namespace.
 *
 * These keys have no direct equivalent in `ra-language-english` and are
 * specific to radish-ui components. Merge this object into your i18n
 * provider messages so that these strings are translatable.
 *
 * @example
 * import polyglotI18nProvider from "ra-i18n-polyglot";
 * import englishMessages from "ra-language-english";
 * import { radishMessages } from "@radish-ui/core";
 *
 * const i18nProvider = polyglotI18nProvider(
 *   () => ({ ...englishMessages, ...radishMessages }),
 *   "en",
 * );
 */
export const radishMessages = {
  radish: {
    action: {
      /** Label shown on a delete button while the deletion is in progress. */
      deleting: "Deleting…",
    },
    message: {
      /** Confirm dialog title shown by <DeleteButton>. */
      delete_confirm_title: "Are you sure you want to delete this record?",
    },
    notification: {
      /** aria-label for the dismiss button inside each toast. */
      dismiss: "Dismiss notification",
      /** aria-label for the notifications container. */
      label: "Notifications",
    },
  },
};
