import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <div className="app-phone">
          <div className="app-phone-inner">
            <App />
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
