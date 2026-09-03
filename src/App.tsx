import { useState } from "react";
import Login from "./pages/Login";
import BoardPage from "./pages/BoardPage";
import BoardListPage from "./pages/BoardListPage";

function App() {
  const [connected, setConnected] = useState<boolean>(!!localStorage.getItem("token"));
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);

  function handleLogout() {
    localStorage.removeItem("token");
    setConnected(false);
    setSelectedBoardId(null);
  }

  if (!connected) return <Login onLogin={() => setConnected(true)} />;

  if (selectedBoardId !== null) {
    return (
      <BoardPage
        boardId={selectedBoardId}
        onLogout={handleLogout}
        onBack={() => setSelectedBoardId(null)}
      />
    );
  }

  return (
    <BoardListPage
      onSelectBoard={setSelectedBoardId}
      onLogout={handleLogout}
    />
  );
}

export default App;