// knockoutUtils.ts

export const knockoutLabels: Record<string, string> = {
  ROUND_OF_16: 'Åttondelsfinal',
  QUARTER_FINAL: 'Kvartsfinal',
  SEMI_FINAL: 'Semifinal',
  FINAL: 'Final',
  WINNER: 'Vinnare'
};

export function getKnockoutLabel(key: string): string {
  return knockoutLabels[key] || key.replace(/_/g, ' ');
}
