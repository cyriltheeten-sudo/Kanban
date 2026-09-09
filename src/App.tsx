import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router";
import { setNavigate } from "./api/navigation";
import type { ReactNode } from "react";
import Login from "./pages/Login";
import BoardListPage from "./pages/BoardListPage";
import BoardPage from "./pages/BoardPage";

function NavigationBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  return null;   // ne rend rien : purement technique
}

function RequireAuth({ children }: { children: ReactNode }) {
  const isAuth = !!localStorage.getItem("token");
  return isAuth ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
      <NavigationBridge />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><BoardListPage /></RequireAuth>} />
        <Route path="/board/:boardId" element={<RequireAuth><BoardPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;