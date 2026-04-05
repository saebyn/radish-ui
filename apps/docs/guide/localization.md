# Localization

All radish-ui components resolve their display strings through React Admin's
i18n system. This means you can override any built-in label or translate the
interface into other languages by configuring the `i18nProvider` on your
`<Admin>` component — no need to change the component files themselves.

## How it works

Every affected component calls `useTranslate` from `ra-core` and looks up its
strings using a translation key. If your `i18nProvider` has a value for that
key, it uses it; otherwise it falls back to the built-in English string.

## Using the built-in React Admin keys

React Admin ships with English messages for its standard keys
(`ra.action.*`, `ra.navigation.*`, etc.) via the `ra-language-english`
package. If you already have an `i18nProvider` set up with those messages, the
radish-ui components will automatically pick up the correct translations.

```tsx
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { radishMessages } from "@radish-ui/core";

const i18nProvider = polyglotI18nProvider(() => englishMessages, "en");

export default function App() {
  return (
    <Admin dataProvider={dataProvider} i18nProvider={i18nProvider}>
      ...
    </Admin>
  );
}
```

## Adding the `radish.*` messages

A small set of strings used by radish-ui components have no equivalent in
`ra-language-english`. These live in the `radish.*` namespace and are provided
by the `radish-messages` bundle that ships with every installed component.

Merge it into your existing messages so those strings are also translatable:

```tsx
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { radishMessages } from "@radish-ui/core";

const i18nProvider = polyglotI18nProvider(
  () => ({ ...englishMessages, ...radishMessages }),
  "en",
);
```

### Available `radish.*` keys

| Key | Default (English) | Used in |
|---|---|---|
| `radish.message.delete_confirm_title` | `"Are you sure you want to delete this record?"` | `<DeleteButton>` |
| `radish.notification.dismiss` | `"Dismiss notification"` | `<Notification>` (dismiss button aria-label) |
| `radish.notification.label` | `"Notifications"` | `<Notification>` (container aria-label) |

## Overriding a string

Pass custom messages when constructing your `i18nProvider`:

```tsx
const i18nProvider = polyglotI18nProvider(
  () => ({
    ...englishMessages,
    ...radishMessages,
    ra: {
      ...englishMessages.ra,
      action: {
        ...englishMessages.ra.action,
        // Override the Create button label
        create: "Add new",
      },
    },
    radish: {
      ...radishMessages.radish,
      message: {
        delete_confirm_title: "Permanently remove this record?",
      },
    },
  }),
  "en",
);
```

## Adding a new language

Provide a translated message bundle for the locale. React Admin's community
already maintains translations for many languages — see the
[Available Translations](https://marmelab.com/react-admin/Translation.html#available-languages)
page in the React Admin docs. Pair those with a translated `radish.*` bundle
for full coverage:

```tsx
import frenchMessages from "ra-language-french";

const frenchRadishMessages = {
  radish: {
    message: {
      delete_confirm_title: "Êtes-vous sûr de vouloir supprimer cet enregistrement ?",
    },
    notification: {
      dismiss: "Fermer la notification",
      label: "Notifications",
    },
  },
};

const i18nProvider = polyglotI18nProvider(
  (locale) => {
    if (locale === "fr") {
      return { ...frenchMessages, ...frenchRadishMessages };
    }
    return { ...englishMessages, ...radishMessages };
  },
  "en",
);
```
