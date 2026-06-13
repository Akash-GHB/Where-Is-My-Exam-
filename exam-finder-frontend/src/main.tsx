import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeTheme } from "./utils/auth.ts";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Apply dark/light class to <html> BEFORE first render
initializeTheme();

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "placeholder-client-id";

createRoot(document.getElementById("root")!).render(
    <GoogleOAuthProvider clientId={clientId}>
        <App />
    </GoogleOAuthProvider>
);
