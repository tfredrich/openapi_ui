import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "./providers/AppProviders";
import { App } from "./App";
import { Buffer } from "buffer";

if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProviders>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProviders>
  </React.StrictMode>
);
