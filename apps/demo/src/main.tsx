import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// oxlint-disable-next-line no-unassigned-import -- CSS side-effect import, intentional
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
