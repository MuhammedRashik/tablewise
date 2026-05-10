import { useState, useEffect } from "react";

/**
 * Returns elapsed minutes + urgency level for an order.
 * Updates every 30 seconds so the UI stays current.
 *
 * urgency levels:
 *   "new"    → < 3 min  (fresh, green)
 *   "normal" → 3–10 min (white)
 *   "amber"  → 10–20 min (amber warning)
 *   "urgent" → > 20 min  (red, flash)
 */
export const useOrderTimer = (createdAt) => {
  const getElapsed = () =>
    Math.floor((Date.now() - new Date(createdAt)) / 60000);

  const [elapsed, setElapsed] = useState(getElapsed);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(getElapsed()), 30_000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const urgency =
    elapsed < 3  ? "new"    :
    elapsed < 10 ? "normal" :
    elapsed < 20 ? "amber"  :
    "urgent";

  const displayTime =
    elapsed < 1  ? "just now" :
    elapsed < 60 ? `${elapsed}m`  :
    `${Math.floor(elapsed / 60)}h ${elapsed % 60}m`;

  return { elapsed, urgency, displayTime };
};