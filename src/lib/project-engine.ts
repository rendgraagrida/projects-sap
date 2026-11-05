import type { Asset, Budget, Journal, JournalLine, Result } from '../types/sap';
import { guardBudgetChange } from './sap-engine';

export type CommitmentOperation = 'CREATE_PR' | 'PR_TO_PO' | 'CREATE_PO' | 'GR_DIRECT' | 'GR_Q' | 'ISSUE_Q' | 'DELIVERY_COMPLETED';
export function convertCommitment(budget: Budget, operation: CommitmentOperation, amount: bigint, prReleaseAmount?: bigint): Result<Budget> {
  if (typeof amount !== 'bigint' || amount <= 0n || amount > 1_000_000_000_000_000n) return { ok: false, error: 'Nominal harus positif dan dalam batas lab.' };
  switch (operation) {
    case 'CREATE_PR': return guardBudgetChange(budget, { pr: amount });
    case 'PR_TO_PO': {
      const prReleased = prReleaseAmount ?? amount;
      if (typeof prReleased !== 'bigint' || prReleased <= 0n || prReleased > 1_000_000_000_000_000n) return { ok: false, error: 'Nominal PR yang dilepas harus positif dan dalam batas lab.' };
      return guardBudgetChange(budget, { pr: -prReleased, po: amount });
    }
    case 'CREATE_PO': return guardBudgetChange(budget, { po: amount });
    case 'GR_DIRECT': return guardBudgetChange(budget, { po: -amount, actual: amount });
    case 'GR_Q': return guardBudgetChange(budget, { po: -amount, heldQ: amount });
    case 'ISSUE_Q': return guardBudgetChange(budget, { heldQ: -amount, actual: amount });
    case 'DELIVERY_COMPLETED': return guardBudgetChange(budget, { po: -amount });
  }
  return { ok: false, error: 'Operasi komitmen tidak didukung.' };
}
export function settleProject(amount: bigint, mode: 'PERIODIC' | 'FULL', assetClass: '2000' | '3000', wbs: string): Result<Journal> {
  if (typeof amount !== 'bigint' || amount < 0n || amount > 1_000_000_000_000_000n) return { ok: false, error: 'Nilai settlement tidak valid.' };
  if (mode !== 'PERIODIC' && mode !== 'FULL' || assetClass !== '2000' && assetClass !== '3000') return { ok: false, error: 'Mode atau kelas aset tidak didukung.' };
  if (typeof wbs !== 'string' || !wbs.trim()) return { ok: false, error: 'WBS sender wajib diisi untuk pratinjau settlement.' };
  if (amount === 0n) return { ok: true, value: { id: 'SANDBOX', tcode: 'CJ88', type: 'AA', description: 'Tidak ada nilai settlement; tidak ada jurnal FI.', lines: [] } };
  const debit = mode === 'PERIODIC' ? '129010' : assetClass === '2000' ? '121020' : '121030';
  const credit = mode === 'PERIODIC' ? '599010' : '129010';
  return { ok: true, value: { id: 'SANDBOX', tcode: 'CJ88', type: 'AA', description: mode === 'PERIODIC' ? 'Periodic: WBS ke AuC kelas 8000; belum disusutkan.' : 'Full: AuC ke aset tetap; sistem nyata dapat menggunakan AIAB/AIBU.', lines: [{ account: debit, label: mode === 'PERIODIC' ? 'AuC' : 'Aset tetap', side: 'DEBIT', amount, postingKey: '70' }, { account: credit, label: mode === 'PERIODIC' ? 'Settlement WBS' : 'AuC', side: 'CREDIT', amount, postingKey: mode === 'PERIODIC' ? '50' : '75', wbs }] } };
}
export function calculateDepreciation(assets: readonly Asset[]): Result<Journal> {
  if (!Array.isArray(assets)) return { ok: false, error: 'Daftar aset tidak valid.' };
  const lines: JournalLine[] = [];
  let total = 0n;
  for (const asset of assets as readonly Asset[]) {
    if (!asset || typeof asset !== 'object') return { ok: false, error: 'Aset tidak valid.' };
    if (typeof asset.value !== 'bigint' || typeof asset.depreciation !== 'bigint' || asset.value < 0n || asset.value > 1_000_000_000_000_000n || asset.depreciation < 0n || asset.depreciation > asset.value) return { ok: false, error: 'Nilai atau akumulasi aset tidak valid.' };
    if (asset.assetClass === '8000') {
      if (asset.depreciation !== 0n) return { ok: false, error: 'AuC lab tidak disusutkan.' };
      continue;
    }
    if (asset.assetClass !== '2000' && asset.assetClass !== '3000') return { ok: false, error: 'Kelas aset tidak didukung.' };
    if (!Number.isSafeInteger(asset.months) || asset.months <= 0) return { ok: false, error: 'Masa manfaat aset harus positif.' };
    const elapsed = asset.elapsedMonths ?? (asset.depreciation === 0n ? 0 : -1);
    if (!Number.isSafeInteger(elapsed) || elapsed < 0 || elapsed > asset.months || (elapsed === 0 && asset.depreciation !== 0n) || (elapsed === asset.months && asset.depreciation !== asset.value)) return { ok: false, error: 'Periode penyusutan aset tidak valid atau belum tersedia.' };
    if (asset.depreciation !== asset.value * BigInt(elapsed) / BigInt(asset.months)) return { ok: false, error: 'Akumulasi tidak sesuai jadwal garis lurus lab.' };
    const target = elapsed >= asset.months - 1 ? asset.value : asset.value * BigInt(elapsed + 1) / BigInt(asset.months);
    const amount = target > asset.depreciation ? target - asset.depreciation : 0n;
    if (amount) { total += amount; lines.push({ account: asset.assetClass === '2000' ? '122020' : '122030', label: `Akumulasi ${asset.id}`, side: 'CREDIT', amount, postingKey: '75' }); }
  }
  if (total) lines.unshift({ account: '610010', label: 'Beban penyusutan', side: 'DEBIT', amount: total, postingKey: '40' });
  return { ok: true, value: { id: 'SANDBOX', tcode: 'AFAB', type: 'AF', description: total ? 'Pratinjau garis lurus bulanan; periode terakhir menyerap sisa pembulatan.' : 'Tidak ada penyusutan; tidak ada jurnal FI.', lines } };
}
