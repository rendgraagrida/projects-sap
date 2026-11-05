import type { Result } from '../types/sap';

export function parseMoney(text: string): Result<bigint> {
  if (typeof text !== 'string') return { ok: false, error: 'Masukkan nominal yang valid.' };
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 20) return { ok: false, error: 'Masukkan nominal nonnegatif yang valid (maksimal 20 karakter).' };
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(trimmed);
  if (!match) return { ok: false, error: 'Masukkan nominal nonnegatif dengan maksimal dua desimal dan titik desimal.' };
  const value = BigInt(match[1]) * 100n + BigInt((match[2] ?? '').padEnd(2, '0'));
  return value <= 1_000_000_000_000_000n ? { ok: true, value } : { ok: false, error: 'Nominal melampaui batas lab.' };
}
export function roundRatio(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new RangeError('Denominator harus positif');
  const sign = numerator < 0n ? -1n : 1n;
  const absolute = numerator < 0n ? -numerator : numerator;
  return sign * ((absolute + denominator / 2n) / denominator);
}
export function formatMoney(amount: bigint): string {
  const sign = amount < 0n ? '-' : '';
  const value = amount < 0n ? -amount : amount;
  return `${sign}$${(value / 100n).toLocaleString('en-US')}.${(value % 100n).toString().padStart(2, '0')}`;
}
