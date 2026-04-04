# Available Components

All components are listed in the registry and can be added to your project with
the `radish add` command.

```bash
npx @radish-ui/cli add <component-name>
```

---

## Layout

### `layout`

Application shell with sidebar and menu.

**Files:** `layout/layout.tsx`, `layout/sidebar.tsx`, `layout/menu.tsx`

**Dependencies:** `@radish-ui/core`, `react-icons`

```bash
npx @radish-ui/cli add layout
```

---

## List & Datagrid

### `list`

Renders a `ListBase` context with a Tailwind-styled container.

**Files:** `list/list.tsx`

**Dependencies:** `@radish-ui/core`

```bash
npx @radish-ui/cli add list
```

### `datagrid`

Responsive table that reads from a `ListContext`.

**Files:** `list/datagrid.tsx`, `skeleton/skeleton.tsx`

**Dependencies:** `@radish-ui/core`

```bash
npx @radish-ui/cli add datagrid
```

### `pagination`

Pagination bar for list views.

**Files:** `list/pagination.tsx`

**Dependencies:** `@radish-ui/core`

```bash
npx @radish-ui/cli add pagination
```

---

## Show / Detail

### `show`

Show view with a skeleton loading state.

**Files:** `detail/show.tsx`, `detail/simple-show-layout.tsx`, `skeleton/skeleton.tsx`

**Dependencies:** `@radish-ui/core`

```bash
npx @radish-ui/cli add show
```

### `edit`

Edit form view.

**Files:** `detail/edit.tsx`, `skeleton/skeleton.tsx`

**Dependencies:** `@radish-ui/core`

```bash
npx @radish-ui/cli add edit
```

### `create`

Create form view.

**Files:** `detail/create.tsx`

**Dependencies:** `@radish-ui/core`

```bash
npx @radish-ui/cli add create
```

---

## Fields

### `text-field`

Displays a plain text value.

**Files:** `field/text-field.tsx`

**Dependencies:** `@radish-ui/core`

```bash
npx @radish-ui/cli add text-field
```

### `boolean-field`

Displays a boolean value as a checkmark or cross.

**Files:** `field/boolean-field.tsx`

**Dependencies:** `@radish-ui/core`

```bash
npx @radish-ui/cli add boolean-field
```

### `number-field`

Displays a numeric value with optional formatting.

**Files:** `field/number-field.tsx`

**Dependencies:** `@radish-ui/core`

```bash
npx @radish-ui/cli add number-field
```

### `date-field`

Displays a date value formatted for the user's locale.

**Files:** `field/date-field.tsx`

**Dependencies:** `@radish-ui/core`

```bash
npx @radish-ui/cli add date-field
```

---

## Buttons

### `edit-button`

Link button that navigates to the edit view for a record.

**Files:** `button/edit-button.tsx`

**Dependencies:** `@radish-ui/core`

```bash
npx @radish-ui/cli add edit-button
```

### `delete-button`

Button that deletes the current record with a confirmation prompt.

**Files:** `button/delete-button.tsx`

**Dependencies:** `@radish-ui/core`

```bash
npx @radish-ui/cli add delete-button
```

### `create-button`

Link button that navigates to the create view.

**Files:** `button/create-button.tsx`

**Dependencies:** `@radish-ui/core`

```bash
npx @radish-ui/cli add create-button
```

---

## Forms

### `simple-form`

A simple form with text, number, select, and boolean inputs.

**Files:** `form/simple-form.tsx`, `form/text-input.tsx`, `form/number-input.tsx`,
`form/select-input.tsx`, `form/boolean-input.tsx`

**Dependencies:** `@radish-ui/core`

```bash
npx @radish-ui/cli add simple-form
```

---

## Utilities

### `skeleton`

A loading skeleton placeholder used by several components internally.

**Files:** `skeleton/skeleton.tsx`

**Dependencies:** `@radish-ui/core`

```bash
npx @radish-ui/cli add skeleton
```
