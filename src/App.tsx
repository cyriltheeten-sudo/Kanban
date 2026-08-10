import { useState } from "react";
import Login from "./pages/Login";
import BoardPage from "./pages/BoardPage";

function App() {
  const [connected, setConnected] = useState<boolean>(!!localStorage.getItem("token"));

  function handleLogout() {
    localStorage.removeItem("token");
    setConnected(false);
  }

  if (!connected) return <Login onLogin={() => setConnected(true)} />;
  return <BoardPage onLogout={handleLogout} />;
}

export default App;