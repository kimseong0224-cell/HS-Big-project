import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import LoginApp from "./pages/Login.jsx";
import SignupApp from "./pages/Signup.jsx";
import FindID from "./pages/FindID.jsx";
import FindPassword from "./pages/FindPassword.jsx";
import MainPage from "./pages/MainPage.jsx";
import BrandConsulting from "./pages/BrandConsulting.jsx";
import "./styles/Login.css";
import "./styles/Signup.css";
import "./styles/FindID.css";
import "./styles/FindPassword.css";
import "./styles/MainPage.css";
import "./styles/BrandConsulting.css";

function App() {
  const [view, setView] = useState("login");

  if (view === "signup") {
    return <SignupApp onBack={() => setView("login")} />;
  }

  if (view === "findid") {
    return <FindID onBack={() => setView("login")} />;
  }

  if (view === "findpw") {
    return <FindPassword onBack={() => setView("login")} />;
  }

  if (view === "main") {
    return <MainPage onLogout={() => setView("login")} onBrand={() => setView("brand")} />;
  }

  if (view === "brand") {
    return (
      <BrandConsulting
        onBack={() => setView("main")}
        onLogout={() => setView("login")}
      />
    );
  }

  return (
    <LoginApp
      onSignup={() => setView("signup")}
      onFindId={() => setView("findid")}
      onFindPw={() => setView("findpw")}
      onLogin={() => setView("main")}
    />
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
