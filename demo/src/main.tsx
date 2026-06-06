import "./index.css";
import ReactDOM from "react-dom/client";
import React from "react";
import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "./ThemeContext";
import { router } from "./router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);
