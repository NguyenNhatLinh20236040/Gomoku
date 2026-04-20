-- Bảng lưu trận đấu
CREATE TABLE IF NOT EXISTS matches (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    mode         TEXT    NOT NULL DEFAULT 'local',
    rule         TEXT    NOT NULL DEFAULT 'gomoku5',
    ai_level     TEXT,
    winner       TEXT    CHECK(winner IN ('X', 'O', 'DRAW')),
    total_moves  INTEGER NOT NULL DEFAULT 0,
    started_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at     DATETIME
);

-- Bảng lưu nước đi
CREATE TABLE IF NOT EXISTS moves (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id  INTEGER NOT NULL,
    turn      INTEGER NOT NULL,
    player    TEXT    NOT NULL CHECK(player IN ('X', 'O')),
    row       INTEGER NOT NULL CHECK(row >= 0 AND row <= 14),
    col       INTEGER NOT NULL CHECK(col >= 0 AND col <= 14),
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

-- Indexes cho tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_moves_match_turn ON moves(match_id, turn);
CREATE INDEX IF NOT EXISTS idx_matches_mode_rule ON matches(mode, rule, started_at);
CREATE INDEX IF NOT EXISTS idx_moves_match_id ON moves(match_id);
