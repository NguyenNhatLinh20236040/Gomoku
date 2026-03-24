// ==========================================
// App.jsx - Component gốc, điều hướng trang
// ==========================================
// Sử dụng state đơn giản để chuyển giữa
// HomePage và Game (không cần react-router cho milestone 1).

import { useState } from 'react';
import HomePage from './pages/HomePage';
import Game from './components/Game';

export default function App() {
  // 'home' = trang chủ, 'game' = đang chơi
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <>
      {currentPage === 'home' && (
        <HomePage onStartGame={() => setCurrentPage('game')} />
      )}
      {currentPage === 'game' && (
        <Game onBack={() => setCurrentPage('home')} />
      )}
    </>
  );
}
