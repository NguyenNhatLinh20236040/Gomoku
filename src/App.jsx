// ==========================================
// App.jsx - Component gốc, điều hướng trang
// ==========================================
// Quản lý navigation giữa HomePage và Game.
// Truyền gameMode (local/ai) và aiLevel (easy/medium)
// xuống Game component.

import { useState } from 'react';
import HomePage from './pages/HomePage';
import Game from './components/Game';

export default function App() {
  // 'home' = trang chủ, 'game' = đang chơi
  const [currentPage, setCurrentPage] = useState('home');
  const [gameMode, setGameMode] = useState('local');    // 'local' | 'ai'
  const [aiLevel, setAiLevel] = useState(null);          // 'easy' | 'medium' | null

  const handleStartGame = (mode, level) => {
    setGameMode(mode);
    setAiLevel(level);
    setCurrentPage('game');
  };

  const handleBackHome = () => {
    setCurrentPage('home');
    setGameMode('local');
    setAiLevel(null);
  };

  return (
    <>
      {currentPage === 'home' && (
        <HomePage onStartGame={handleStartGame} />
      )}
      {currentPage === 'game' && (
        <Game
          onBack={handleBackHome}
          gameMode={gameMode}
          aiLevel={aiLevel}
        />
      )}
    </>
  );
}
