// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";

// Correct router import (your folder is `src/auth/`)
import AppRouter from "./auth/AppRouter.jsx";

import "./index.css";

// Providers
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { DataProvider } from "./context/DataContext.jsx";
import { AuthProvider } from "./auth/AuthProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>       {/* Auth should wrap AppRouter */}
        <DataProvider>     {/* DataProvider should wrap App */}
          <AppRouter />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
