// =============================================
// apiClient.js — Frontend API client
// =============================================
// Gọi backend Express server (port 3001)
// Thông qua Vite proxy: /api/* → localhost:3001/api/*

const BASE_URL = '/api';

/**
 * Helper fetch wrapper
 */
async function request(url, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const json = await res.json();
    if (!res.ok) {
      console.error(`API Error [${res.status}]:`, json.error);
      return { data: null, error: json.error };
    }
    return json;
  } catch (err) {
    console.error('API Request failed:', err);
    return { data: null, error: err.message };
  }
}

// =============================================
// MATCHES
// =============================================

/**
 * Tạo trận đấu mới
 * @param {string} mode - 'local' | 'ai'
 * @param {string} rule - 'gomoku3' | 'gomoku5'
 * @param {string|null} aiLevel - 'easy' | 'medium' | 'hard'
 * @param {string|null} aiSide - 'X' | 'O'
 * @returns {Promise<{data: object, error: string|null}>}
 */
export async function createMatch(mode, rule, aiLevel = null, aiSide = null) {
  return request('/matches', {
    method: 'POST',
    body: JSON.stringify({ mode, rule, ai_level: aiLevel, ai_side: aiSide }),
  });
}

/**
 * Cập nhật kết quả trận đấu
 * @param {number} matchId
 * @param {string} winner - 'X' | 'O' | 'DRAW'
 * @param {number} durationSeconds - Thời gian trận đấu (giây)
 */
export async function endMatch(matchId, winner, durationSeconds = 0) {
  return request(`/matches/${matchId}`, {
    method: 'PATCH',
    body: JSON.stringify({ winner, duration_seconds: durationSeconds }),
  });
}

/**
 * Lấy danh sách trận đấu
 * @param {number} limit
 * @param {number} offset
 * @param {string} mode - Filter theo mode
 */
export async function getMatches(limit = 50, offset = 0, mode = '') {
  const params = new URLSearchParams({ limit, offset });
  if (mode) params.set('mode', mode);
  return request(`/matches?${params}`);
}

/**
 * Lấy chi tiết trận đấu + danh sách nước đi
 * @param {number} matchId
 */
export async function getMatchDetail(matchId) {
  return request(`/matches/${matchId}`);
}

/**
 * Xóa trận đấu
 * @param {number} matchId
 */
export async function deleteMatch(matchId) {
  return request(`/matches/${matchId}`, { method: 'DELETE' });
}

/**
 * Lấy thống kê
 */
export async function getMatchStats() {
  return request('/matches/stats');
}

// =============================================
// MOVES
// =============================================

/**
 * Ghi nước đi vào DB
 * @param {number} matchId
 * @param {number} turn - Số thứ tự nước đi
 * @param {string} player - 'X' | 'O'
 * @param {number} row
 * @param {number} col
 */
export async function addMove(matchId, turn, player, row, col) {
  return request(`/matches/${matchId}/moves`, {
    method: 'POST',
    body: JSON.stringify({ turn, player, row, col }),
  });
}
