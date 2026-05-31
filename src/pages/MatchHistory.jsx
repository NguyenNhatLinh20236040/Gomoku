// ==========================================
// MatchHistory.jsx - Trang lịch sử trận đấu
// ==========================================
// Hiển thị danh sách trận đã chơi, filter,
// thống kê, và xem lại (replay) từng trận.

import { useState, useEffect } from 'react';
import { getMatches, getMatchStats, deleteMatch } from '../utils/apiClient';
import MatchReplay from '../components/MatchReplay';

// Helpers
const MODE_LABELS = { local: '👥 Local', ai: '🤖 vs AI' };
const RULE_LABELS = { gomoku3: '3×3 ⚡', gomoku5: '15×15 ⭐' };
const AI_LEVEL_LABELS = { easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard' };

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getResultBadge(match) {
  if (match.winner === 'DRAW') {
    return { text: 'Draw', emoji: '🤝', color: 'bg-amber-100 text-amber-700 border-amber-200' };
  }
  if (match.mode === 'ai') {
    const playerWon = match.winner !== match.ai_side;
    return playerWon
      ? { text: 'You Won', emoji: '🏆', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
      : { text: 'AI Won', emoji: '🤖', color: 'bg-red-100 text-red-700 border-red-200' };
  }
  return {
    text: `${match.winner} Wins`,
    emoji: '🏆',
    color: 'bg-pink-100 text-pink-700 border-pink-200'
  };
}

/**
 * @param {function} onBack - Quay về trang chủ
 * @param {function} onViewReplay - Xem replay trận đấu
 */
export default function MatchHistory({ onBack }) {
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'local' | 'ai'
  const [replayMatchId, setReplayMatchId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Load data
  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchRes, statsRes] = await Promise.all([
        getMatches(50, 0, filter === 'all' ? '' : filter),
        getMatchStats(),
      ]);
      setMatches(matchRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('Failed to load match history:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await deleteMatch(id);
      setMatches(prev => prev.filter(m => m.id !== id));
      // Reload stats
      const statsRes = await getMatchStats();
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('Failed to delete match:', err);
    }
    setDeletingId(null);
  };

  // Nếu đang xem replay
  if (replayMatchId) {
    return (
      <MatchReplay
        matchId={replayMatchId}
        onBack={() => setReplayMatchId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 flex flex-col items-center py-6 px-4 text-pink-900">

      {/* ===== HEADER ===== */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/70 hover:bg-white/90 text-pink-900 rounded-lg transition-all cursor-pointer shadow-sm"
        >
          <span>←</span>
          <span>Home</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-pink-900 tracking-tight">
          📋 Match History
        </h1>
        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* ===== STATS CARDS ===== */}
      {stats && (() => {
        // Tính toán thống kê chính xác
        const totalGames = stats.total || 0;
        const drawCount = stats.byResult?.find(r => r.winner === 'DRAW')?.count || 0;
        const xWins = stats.byResult?.find(r => r.winner === 'X')?.count || 0;
        const oWins = stats.byResult?.find(r => r.winner === 'O')?.count || 0;
        const decidedGames = xWins + oWins;
        const aiGames = stats.byMode?.find(m => m.mode === 'ai')?.count || 0;
        const localGames = stats.byMode?.find(m => m.mode === 'local')?.count || 0;

        // Tính thống kê từ danh sách matches cho bảng tỉ số
        const localMatches = matches.filter(m => m.mode === 'local');
        const aiMatches = matches.filter(m => m.mode === 'ai');

        const localP1Wins = localMatches.filter(m => m.winner === 'X').length;
        const localP2Wins = localMatches.filter(m => m.winner === 'O').length;
        const localDraws = localMatches.filter(m => m.winner === 'DRAW').length;

        // AI stats theo từng level
        const aiByLevel = ['easy', 'medium', 'hard'].map(level => {
          const levelMatches = aiMatches.filter(m => m.ai_level === level);
          const playerWins = levelMatches.filter(m => m.winner && m.winner !== 'DRAW' && m.winner !== m.ai_side).length;
          const aiWins = levelMatches.filter(m => m.winner && m.winner !== 'DRAW' && m.winner === m.ai_side).length;
          const draws = levelMatches.filter(m => m.winner === 'DRAW').length;
          return { level, total: levelMatches.length, playerWins, aiWins, draws };
        });

        const totalPlayerWinsAI = aiByLevel.reduce((s, l) => s + l.playerWins, 0);
        const totalAIWins = aiByLevel.reduce((s, l) => s + l.aiWins, 0);
        const totalAIDraws = aiByLevel.reduce((s, l) => s + l.draws, 0);

        return (
          <>
            {/* Stats Cards */}
            <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 animate-fade-in">
              <div className="bg-white/80 rounded-xl p-4 text-center shadow-sm border border-pink-100">
                <div className="text-2xl font-black text-pink-700">{totalGames}</div>
                <div className="text-xs text-pink-500 mt-1">Total Games</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4 text-center shadow-sm border border-pink-100">
                <div className="text-2xl font-black text-emerald-600">{decidedGames}</div>
                <div className="text-xs text-pink-500 mt-1">Decided</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4 text-center shadow-sm border border-pink-100">
                <div className="text-2xl font-black text-amber-600">{drawCount}</div>
                <div className="text-xs text-pink-500 mt-1">Draws</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4 text-center shadow-sm border border-pink-100">
                <div className="text-2xl font-black text-sky-600">{aiGames}</div>
                <div className="text-xs text-pink-500 mt-1">vs AI</div>
              </div>
            </div>

            {/* ===== BẢNG TỈ SỐ (SCOREBOARD) ===== */}
            {totalGames > 0 && (
              <div className="w-full max-w-2xl bg-white/85 rounded-xl shadow-sm border border-pink-100 mb-6 overflow-hidden animate-fade-in">
                <div className="px-4 py-3 bg-pink-600 text-white flex items-center gap-2">
                  <span className="text-lg">🏆</span>
                  <h2 className="text-sm font-bold tracking-wide">SCOREBOARD</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-pink-100">
                        <th className="text-left py-2.5 px-4 text-pink-500 font-semibold text-xs">Mode</th>
                        <th className="text-center py-2.5 px-2 text-pink-500 font-semibold text-xs">Games</th>
                        <th className="text-center py-2.5 px-2 font-semibold text-xs text-emerald-600">W</th>
                        <th className="text-center py-2.5 px-2 font-semibold text-xs text-red-500">L</th>
                        <th className="text-center py-2.5 px-2 font-semibold text-xs text-amber-600">D</th>
                        <th className="text-center py-2.5 px-2 text-pink-500 font-semibold text-xs">Win%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Local mode */}
                      {localGames > 0 && (
                        <tr className="border-b border-pink-50 hover:bg-pink-50/50 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-base">👥</span>
                              <div>
                                <div className="font-semibold text-pink-800 text-xs">Local</div>
                                <div className="text-[10px] text-pink-400">P1(X) vs P2(O)</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-2.5 px-2 font-bold text-pink-700">{localMatches.length}</td>
                          <td className="text-center py-2.5 px-2">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs">{localP1Wins}</span>
                          </td>
                          <td className="text-center py-2.5 px-2">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 text-red-600 font-bold text-xs">{localP2Wins}</span>
                          </td>
                          <td className="text-center py-2.5 px-2">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 text-amber-600 font-bold text-xs">{localDraws}</span>
                          </td>
                          <td className="text-center py-2.5 px-2">
                            <span className="text-xs font-bold text-pink-600">
                              {localMatches.length > 0 ? Math.round((localP1Wins / localMatches.length) * 100) : 0}%
                            </span>
                          </td>
                        </tr>
                      )}

                      {/* AI modes by level */}
                      {aiByLevel.filter(l => l.total > 0).map(({ level, total, playerWins, aiWins, draws }) => (
                        <tr key={level} className="border-b border-pink-50 hover:bg-pink-50/50 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-base">🤖</span>
                              <div>
                                <div className="font-semibold text-pink-800 text-xs">vs AI</div>
                                <div className="text-[10px] text-pink-400">{AI_LEVEL_LABELS[level]}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-2.5 px-2 font-bold text-pink-700">{total}</td>
                          <td className="text-center py-2.5 px-2">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs">{playerWins}</span>
                          </td>
                          <td className="text-center py-2.5 px-2">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 text-red-600 font-bold text-xs">{aiWins}</span>
                          </td>
                          <td className="text-center py-2.5 px-2">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 text-amber-600 font-bold text-xs">{draws}</span>
                          </td>
                          <td className="text-center py-2.5 px-2">
                            <span className="text-xs font-bold text-pink-600">
                              {total > 0 ? Math.round((playerWins / total) * 100) : 0}%
                            </span>
                          </td>
                        </tr>
                      ))}

                      {/* Tổng cộng AI */}
                      {aiGames > 0 && (
                        <tr className="bg-pink-50/80 border-t border-pink-200">
                          <td className="py-2.5 px-4">
                            <div className="font-bold text-pink-700 text-xs">Total vs AI</div>
                          </td>
                          <td className="text-center py-2.5 px-2 font-black text-pink-700">{aiMatches.length}</td>
                          <td className="text-center py-2.5 px-2">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs">{totalPlayerWinsAI}</span>
                          </td>
                          <td className="text-center py-2.5 px-2">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-100 text-red-600 font-black text-xs">{totalAIWins}</span>
                          </td>
                          <td className="text-center py-2.5 px-2">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-600 font-black text-xs">{totalAIDraws}</span>
                          </td>
                          <td className="text-center py-2.5 px-2">
                            <span className="text-xs font-black text-pink-700">
                              {aiMatches.length > 0 ? Math.round((totalPlayerWinsAI / aiMatches.length) * 100) : 0}%
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div className="px-4 py-2 border-t border-pink-100 flex items-center gap-4 text-[10px] text-pink-400">
                  <span><span className="font-bold text-emerald-600">W</span> = Player Win</span>
                  <span><span className="font-bold text-red-500">L</span> = Loss</span>
                  <span><span className="font-bold text-amber-600">D</span> = Draw</span>
                  <span><span className="font-bold text-pink-600">Win%</span> = Player Win Rate</span>
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* ===== FILTER TABS ===== */}
      <div className="w-full max-w-2xl flex gap-2 mb-4">
        {[
          { key: 'all', label: '📊 All' },
          { key: 'local', label: '👥 Local' },
          { key: 'ai', label: '🤖 AI' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`
              px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer
              ${filter === tab.key
                ? 'bg-pink-600 text-white shadow-md shadow-pink-300/40'
                : 'bg-white/70 text-pink-700 hover:bg-white/90'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== MATCH LIST ===== */}
      <div className="w-full max-w-2xl space-y-3">
        {loading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/60 rounded-xl p-5 animate-shimmer h-24" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          // Empty state
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-pink-700 mb-2">No matches yet</h3>
            <p className="text-pink-500 text-sm">Play some games and they will appear here!</p>
            <button
              onClick={onBack}
              className="mt-6 px-6 py-3 bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-300/40 hover:bg-pink-500 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              🎯 Start Playing
            </button>
          </div>
        ) : (
          // Match cards
          matches.map((match, index) => {
            const result = getResultBadge(match);
            return (
              <div
                key={match.id}
                className="bg-white/85 rounded-xl p-4 shadow-sm border border-pink-100 hover:shadow-md hover:border-pink-200 transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      {/* Result badge */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${result.color}`}>
                        {result.emoji} {result.text}
                      </span>
                      {/* Mode */}
                      <span className="text-xs text-pink-500 font-medium">
                        {MODE_LABELS[match.mode] || match.mode}
                      </span>
                      {/* AI Level */}
                      {match.ai_level && (
                        <span className="text-xs text-pink-400">
                          {AI_LEVEL_LABELS[match.ai_level]}
                        </span>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-xs text-pink-400">
                      <span>{RULE_LABELS[match.rule] || match.rule}</span>
                      <span>•</span>
                      <span>{match.total_moves} moves</span>
                      <span>•</span>
                      <span>{formatDuration(match.duration_seconds)}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{formatDate(match.started_at)}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setReplayMatchId(match.id)}
                      className="px-3 py-1.5 bg-pink-500 hover:bg-pink-400 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                      title="Replay"
                    >
                      ▶️ Replay
                    </button>
                    <button
                      onClick={() => handleDelete(match.id)}
                      disabled={deletingId === match.id}
                      className="px-2 py-1.5 text-pink-300 hover:text-red-500 text-xs transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===== FOOTER ===== */}
      {matches.length > 0 && (
        <div className="mt-6 text-pink-400 text-xs">
          Showing {matches.length} match{matches.length !== 1 ? 'es' : ''}
        </div>
      )}
    </div>
  );
}
