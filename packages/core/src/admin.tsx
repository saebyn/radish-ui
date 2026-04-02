import React from "react";
import {
  CoreAdminContext,
  CoreAdminUI,
  type CoreAdminContextProps,
  type CoreAdminUIProps,
} from "ra-core";

export type AdminProps = CoreAdminContextProps &
  Omit<CoreAdminUIProps, "children"> & {
    children?: React.ReactNode;
  };

/**
 * Root Admin component that wires up ra-core's CoreAdminContext and CoreAdminUI.
 * Drop-in replacement for react-admin's <Admin> without any Material UI dependency.
 *
 * @example
 * <Admin dataProvider={dataProvider} layout={Layout}>
 *   <Resource name="posts" list={PostList} />
 * </Admin>
 */
export function Admin({
  // CoreAdminContext props
  dataProvider,
  authProvider,
  i18nProvider,
  store,
  queryClient,
  // CoreAdminUI props
  layout,
  dashboard,
  catchAll,
  loading,
  requireAuth,
  ready,
  title,
  // children (Resources)
  children,
}: AdminProps) {
  return (
    <CoreAdminContext
      dataProvider={dataProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      store={store}
      queryClient={queryClient}
    >
      <CoreAdminUI
        layout={layout}
        dashboard={dashboard}
        catchAll={catchAll}
        loading={loading}
        requireAuth={requireAuth}
        ready={ready}
        title={title}
      >
        {children}
      </CoreAdminUI>
    </CoreAdminContext>
  );
}
