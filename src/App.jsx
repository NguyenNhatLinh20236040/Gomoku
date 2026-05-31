// ==========================================
// App.jsx - Component gốc, điều hướng trang
// ==========================================
// Quản lý navigation giữa HomePage, Game, và MatchHistory.
// Truyền gameMode (local/ai), aiLevel (easy/medium/hard),
// và ruleSet (3row/5row) xuống Game component.

import { useState } from 'react';
import HomePage from './pages/HomePage';
import MatchHistory from './pages/MatchHistory';
import Game from './components/Game';

export default function App() {
  // 'home' = trang chủ, 'game' = đang chơi, 'history' = lịch sử
  const [currentPage, setCurrentPage] = useState('home');
  const [gameMode, setGameMode] = useState('local');    // 'local' | 'ai'
  const [aiLevel, setAiLevel] = useState(null);          // 'easy' | 'medium' | 'hard' | null
  const [ruleSet, setRuleSet] = useState('5row');        // '3row' | '5row'

  const handleStartGame = (mode, level, rule = '5row') => {
    setGameMode(mode);
    setAiLevel(level);
    setRuleSet(rule);
    setCurrentPage('game');
  };

  const handleBackHome = () => {
    setCurrentPage('home');
    setGameMode('local');
    setAiLevel(null);
  };

  const handleOpenHistory = () => {
    setCurrentPage('history');
  };

  return (
    <>
      {currentPage === 'home' && (
        <HomePage
          onStartGame={handleStartGame}
          onOpenHistory={handleOpenHistory}
        />
      )}
      {currentPage === 'game' && (
        <Game
          onBack={handleBackHome}
          gameMode={gameMode}
          aiLevel={aiLevel}
          ruleSet={ruleSet}
        />
      )}
      {currentPage === 'history' && (
        <MatchHistory
          onBack={handleBackHome}
        />
      )}
    </>
  );
}
