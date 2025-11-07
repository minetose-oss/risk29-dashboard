import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker } from "./lib/pwaUtils";
import { Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

createRoot(document.getElementById("root")!).render(
  <Router hook={useHashLocation}>
    <App />
  </Router>
);

// Register service worker for PWA
if (import.meta.env.PROD) {
  registerServiceWorker();
}
