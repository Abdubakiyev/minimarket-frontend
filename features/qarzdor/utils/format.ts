// features/qarzdor/utils/format.ts

export function formatSum(amount: number): string {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function progressPercent(tolangan: number, umumiy: number): number {
  if (umumiy === 0) return 0;
  return Math.round((tolangan / umumiy) * 100);
}