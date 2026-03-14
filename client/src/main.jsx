import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { registerSW } from "virtual:pwa-register";

if (import.meta.env.PROD) {
  registerSW({
    onNeedRefresh() {
      console.log("Nouveau contenu disponible, merci de rafraîchir.");
    },
    onOfflineReady() {
      console.log("Application prête pour une utilisation hors-ligne.");
    },
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
