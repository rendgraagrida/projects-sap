import type { Asset, Budget, Journal, JournalLine, Result } from '../types/sap';
import { guardBudgetChange } from './sap-engine';
import { roundRatio } from './sap-money';

export type CommitmentOperation = 'CREATE_PR' | 'PR_TO_PO' | 'CREATE_PO' | 'GR_DIRECT' | 'GR_Q' | 'ISSUE_Q' | 'DELIVERY_COMPLETED';
export function convertCommitment(budget: Budget, operation: CommitmentOperation, amount: bigint, prReleaseAmount?: bigint): Result<Budget> {
  if (amount <= 0n) return { ok: false, error: 'Nominal harus positif.' };
  switch (operation) {
    case 'CREATE_PR': return guardBudgetChange(budget, { pr: amount });
    case 'PR_TO_PO': {
      const prReleased = prReleaseAmount ?? (budget.pr > 0n ? budget.pr : amount);
      return guardBudgetChange(budget, { pr: -prReleased, po: amount });
    }
    case 'CREATE_PO': return guardBudgetChange(budget, { po: amount });
    case 'GR_DIRECT': return guardBudgetChange(budget, { po: -amount, actual: amount });
    case 'GR_Q': return guardBudgetChange(budget, { po: -amount, heldQ: amount });
    case 'ISSUE_Q': return guardBudgetChange(budget, { heldQ: -amount, actual: amount });
    case 'DELIVERY_COMPLETED': return guardBudgetChange(budget, { po: -amount });
  }
}
export function settleProject(amount: bigint, mode: 'PERIODIC' | 'FULL', assetClass: '2000' | '3000', wbs: string): Result<Journal> {
  if (amount <= 0n) return { ok: false, error: 'Nilai settlement harus positif.' };
  if (!wbs.trim()) return { ok: false, error: 'KD 503: WBS dan aturan settlement wajib diisi.' };
  const debit = mode === 'PERIODIC' ? '129010' : assetClass === '2000' ? '121020' : '121030';
  const credit = mode === 'PERIODIC' ? '599010' : '129010';
  return { ok: true, value: { id: 'SANDBOX', tcode: 'CJ88', type: 'AA', description: mode === 'PERIODIC' ? 'Periodic: WBS ke AuC kelas 8000; belum disusutkan.' : 'Full: AuC ke aset tetap; sistem nyata dapat menggunakan AIAB/AIBU.', lines: [{ account: debit, label: mode === 'PERIODIC' ? 'AuC' : 'Aset tetap', side: 'DEBIT', amount, postingKey: '70' }, { account: credit, label: mode === 'PERIODIC' ? 'Settlement WBS' : 'AuC', side: 'CREDIT', amount, postingKey: mode === 'PERIODIC' ? '50' : '75', wbs }] } };
}
export function calculateDepreciation(assets: readonly Asset[]): Result<Journal> {
  const lines: JournalLine[] = [];
  let total = 0n;
  for (const asset of assets) {
    if (asset.assetClass === '8000') continue;
    if (asset.months <= 0 || !Number.isInteger(asset.months)) return { ok: false, error: 'Masa manfaat aset harus positif.' };
    const remaining = asset.value - asset.depreciation;
    if (remaining < 0n) return { ok: false, error: 'Akumulasi penyusutan melebihi nilai aset.' };
    const monthly = roundRatio(asset.value, BigInt(asset.months));
    const amount = monthly < remaining ? monthly : remaining;
    if (amount) { total += amount; lines.push({ account: asset.assetClass === '2000' ? '122020' : '122030', label: `Akumulasi ${asset.id}`, side: 'CREDIT', amount, postingKey: '75' }); }
  }
  if (total) lines.unshift({ account: '610010', label: 'Beban penyusutan', side: 'DEBIT', amount: total, postingKey: '40' });
  return { ok: true, value: { id: 'SANDBOX', tcode: 'AFAB', type: 'AF', description: total ? 'Penyusutan garis lurus bulanan.' : 'AuC tidak disusutkan; tidak ada jurnal FI.', lines } };
}
