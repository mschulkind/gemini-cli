/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const formatMemoryUsage = (bytes: number): string => {
  const gb = bytes / (1024 * 1024 * 1024);
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${gb.toFixed(2)} GB`;
};

/**
 * Formats a duration in milliseconds into a concise, human-readable string (e.g., "1h 5s").
 * It omits any time units that are zero.
 * @param milliseconds The duration in milliseconds.
 * @returns A formatted string representing the duration.
 */
export const formatDuration = (milliseconds: number): string => {
  if (milliseconds <= 0) {
    return '0s';
  }

  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`;
  }

  const totalSeconds = milliseconds / 1000;

  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)}s`;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (seconds > 0) {
    parts.push(`${seconds}s`);
  }

  // If all parts are zero (e.g., exactly 1 hour), return the largest unit.
  if (parts.length === 0) {
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  }

  return parts.join(' ');
};

/**
 * formatTokenCount
 *
 * Format a token count either as a short, human-friendly shorthand (e.g., "12.3k")
 * or as a full integer with commas (e.g., "12,345").
 *
 * Edge-case examples:
 *  - formatTokenCount(0, true)  => "0"
 *  - formatTokenCount(999, true) => "999"
 *  - formatTokenCount(1000, true) => "1.0k"
 *  - formatTokenCount(12345, true) => "12.3k"
 *  - formatTokenCount(12345, false) => "12,345"
 *
 * @param tokens The token count to format.
 * @param short Whether to use shorthand (true) or full integer with commas (false). Defaults to true.
 */
export const formatTokenCount = (tokens: number, short = true): string => {
  const n = Number.isFinite(tokens) ? Math.round(tokens) : 0;
  if (n <= 0) return '0';

  if (!short) {
    return new Intl.NumberFormat('en-US').format(n);
  }

  const abs = Math.abs(n);

  // Below 1k, show plain integer
  if (abs < 1000) {
    return `${n}`;
  }

  // Define units for shorthand formatting
  const units = [
    { value: 1_000_000_000, suffix: 'B' },
    { value: 1_000_000, suffix: 'M' },
    { value: 1_000, suffix: 'k' },
  ];

  for (const unit of units) {
    if (abs >= unit.value) {
      const v = n / unit.value;
      // Show one decimal for values below 100 (e.g., 12.3k), otherwise no decimals (e.g., 123k).
      // This keeps short representations human-friendly for common magnitudes.
      const formatted = Math.abs(v) < 100 ? v.toFixed(1) : v.toFixed(0);
      return `${formatted}${unit.suffix}`;
    }
  }

  // Fallback to integer
  return `${n}`;
};
