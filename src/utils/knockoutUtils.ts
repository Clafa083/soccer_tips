// knockoutUtils.ts

export const knockoutLabels: Record<string, string> = {
  ROUND_OF_32: 'Till sextondelsfinaler',
  ROUND_OF_16: 'Till åttondelsfinaler',
  QUARTER_FINAL: 'Till kvartsfinaler',
  SEMI_FINAL: 'Till semifinaler',
  FINAL: 'Till final',
  WINNER: 'Vinnare'
};

export function getKnockoutLabel(key: string): string {
  return knockoutLabels[key] || key.replace(/_/g, ' ');
}
