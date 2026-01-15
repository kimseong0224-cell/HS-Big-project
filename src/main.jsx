// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

/** ✅ 모든 CSS는 여기서 한 번에 import */
import "react-datepicker/dist/react-datepicker.css";
import "./styles/Login.css";
import "./styles/Signup.css";
import "./styles/FindID.css";
import "./styles/FindPassword.css";
import "./styles/MainPage.css";
import "./styles/DiagnosisHome.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
