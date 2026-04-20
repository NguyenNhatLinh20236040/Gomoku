// ==========================================
// useTimer.js - Custom hook đếm ngược lượt
// ==========================================
// Quản lý countdown timer cho mỗi lượt chơi.
// Tự động gọi onTimeout khi hết giờ.
// ==========================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * @param {number} initialSeconds - Số giây ban đầu (default 30)
 * @param {function} onTimeout - Callback khi hết giờ
 * @returns {{ timeLeft, isRunning, start, pause, reset }}
 */
export default function useTimer(initialSeconds = 30, onTimeout) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const onTimeoutRef = useRef(onTimeout);
  const intervalRef = useRef(null);

  // Cập nhật ref khi callback thay đổi
  onTimeoutRef.current = onTimeout;

  // Countdown logic
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          // Gọi timeout callback
          if (onTimeoutRef.current) {
            // Dùng setTimeout để tránh setState trong setState
            setTimeout(() => onTimeoutRef.current(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newSeconds) => {
    setIsRunning(false);
    setTimeLeft(newSeconds ?? initialSeconds);
    // Auto start sau reset
    setTimeout(() => setIsRunning(true), 50);
  }, [initialSeconds]);

  return { timeLeft, isRunning, start, pause, reset };
}
