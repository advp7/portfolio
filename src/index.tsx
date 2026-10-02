import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./theme";
import { IntroProvider } from "./intro";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <ThemeProvider>
    <IntroProvider>
      <App />
    </IntroProvider>
  </ThemeProvider>
);
