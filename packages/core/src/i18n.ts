/**
 * The shape of the `radish.*` translation namespace.
 *
 * Use this type when building a translated bundle for a language other than
 * English so TypeScript can catch missing or misspelled keys:
 *
 * @example
 * import type { RadishMessages } from "@radish-ui/core";
 *
 * const frenchRadishMessages: RadishMessages = {
 *   radish: {
 *     action: { deleting: "Suppression…" },
 *     message: { delete_confirm_title: "Êtes-vous sûr de vouloir supprimer cet enregistrement ?" },
 *     notification: { dismiss: "Fermer la notification", label: "Notifications" },
 *   },
 * };
 */
export interface RadishMessages {
  radish: {
    action: {
      /** Label shown on a delete button while the deletion is in progress. */
      deleting: string;
    };
    message: {
      /** Confirm dialog title shown by <DeleteButton>. */
      delete_confirm_title: string;
    };
    notification: {
      /** aria-label for the dismiss button inside each toast. */
      dismiss: string;
      /** aria-label for the notifications container. */
      label: string;
    };
  };
}

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
export const radishMessages: RadishMessages = {
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
