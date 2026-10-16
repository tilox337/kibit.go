// 850 -> "850 м", 3200 -> "3.2 км"
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} м`;
  return `${(meters / 1000).toFixed(1)} км`;
}

// 540 -> "9 мин", 4500 -> "1 ч 15 мин"
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  if (totalMinutes < 60) return `${totalMinutes} мин`;
  const hours = Math.floor(totalMinutes / 60);
  return `${hours} ч ${totalMinutes % 60} мин`;
}
