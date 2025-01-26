import "./index.css";
import ReactDOM from "react-dom/client";
import React from "react";
import { ThemeProvider } from "./ThemeContext";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
