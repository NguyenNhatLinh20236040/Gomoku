// ==========================================
// HomePage.jsx - Home screen
// ==========================================

import { useState } from 'react';
import AILevelModal from '../components/AILevelModal';
import RuleModal from '../components/RuleModal';

const RULE_LABELS = {
  '3row': '3×3 ⚡',
  '5row': '15×15 ⭐',
};

/**
 * @param {function} onStartGame - Start game with mode, level, ruleSet
 * @param {function} onOpenHistory - Open match history page
 */
export default function HomePage({ onStartGame, onOpenHistory }) {
  const [showAIModal, setShowAIModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState('5row');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 flex flex-col items-center justify-center px-4 text-pink-900">

      {/* ===== LOGO & TITLE ===== */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="w-24 h-24 mx-auto mb-6 bg-pink-600 rounded-2xl flex items-center justify-center shadow-xl shadow-pink-300/60">
          <div className="grid grid-cols-3 gap-1">
            {['X', '', 'O', '', 'X', '', 'O', '', 'X'].map((v, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs font-bold
                  ${v === 'X' ? 'bg-white text-pink-600' : ''}
                  ${v === 'O' ? 'bg-pink-400 text-white' : ''}
                  ${!v ? 'bg-pink-200/60' : ''}
                `}
              >
                {v}
              </div>
            ))}
          </div>
        </div>

        <h1 className="text-5xl sm:text-6xl font-black text-pink-900 tracking-tight mb-3">
          GOMOKU
        </h1>
        <p className="text-pink-700 text-lg">
          Line up to win — Classic strategy game
        </p>
      </div>

      {/* ===== RULE SELECTOR ===== */}
      <div className="w-full max-w-md mb-6 animate-fade-in">
        <button
          onClick={() => setShowRuleModal(true)}
          className="w-full py-3 px-6 bg-white/60 hover:bg-white/80 text-pink-800 font-semibold rounded-xl border-2 border-pink-200 hover:border-pink-300 shadow-sm transition-all cursor-pointer flex items-center justify-between"
        >
          <span className="text-sm text-pink-500">Rules:</span>
          <span className="text-lg font-bold">{RULE_LABELS[selectedRule]}</span>
          <span className="text-pink-400 text-xs">Change ▸</span>
        </button>
      </div>

      {/* ===== GAME MODES ===== */}
      <div className="w-full max-w-md space-y-4 animate-fade-in">
        <button
          onClick={() => onStartGame('local', null, selectedRule)}
          className="animate-stagger-1 w-full py-4 px-6 bg-pink-600 hover:bg-pink-500 text-white text-xl font-bold rounded-xl shadow-lg shadow-pink-400/40 hover:shadow-pink-400/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          👥 Local 2 Players
        </button>

        <button
          onClick={() => setShowAIModal(true)}
          className="animate-stagger-2 w-full py-4 px-6 bg-white/80 hover:bg-white/95 text-pink-800 text-xl font-bold rounded-xl border-2 border-pink-300 hover:border-pink-400 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          🤖 Play vs AI
          <span className="block text-sm font-normal mt-1 text-pink-500">
            Choose difficulty to start
          </span>
        </button>

        {/* ===== MATCH HISTORY BUTTON ===== */}
        <button
          onClick={onOpenHistory}
          className="animate-stagger-3 w-full py-4 px-6 bg-white/60 hover:bg-white/80 text-pink-700 text-xl font-bold rounded-xl border-2 border-pink-200 hover:border-pink-300 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          📋 Match History
          <span className="block text-sm font-normal mt-1 text-pink-400">
            View past games & replays
          </span>
        </button>
      </div>

      {/* AI Level Modal */}
      {showAIModal && (
        <AILevelModal
          onSelect={(level) => {
            setShowAIModal(false);
            onStartGame('ai', level, selectedRule);
          }}
          onClose={() => setShowAIModal(false)}
        />
      )}

      {/* Rule Modal */}
      {showRuleModal && (
        <RuleModal
          onSelect={(rule) => {
            setSelectedRule(rule);
            setShowRuleModal(false);
          }}
          onClose={() => setShowRuleModal(false)}
        />
      )}
    </div>
  );
}
