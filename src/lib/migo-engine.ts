import type { Journal, JournalLine, ObycKey, Result } from '../types/sap';
import { resolveObycAccount } from './sap-engine';

export interface MigoInput { movement: string; amount: bigint; projectStock: boolean; wbs: string }
export function simulateMigo(input: MigoInput): Result<Journal> {
  const { movement, amount, projectStock, wbs } = input;
  if (amount <= 0n) return { ok: false, error: 'Nilai harus lebih besar dari nol.' };
  const result: Journal = { id: 'SANDBOX', tcode: `MIGO ${movement}${projectStock ? ' Q' : ''}`, type: 'WA', description: '', lines: [] };
  const keys: Record<string, [ObycKey, ObycKey] | null> = { '101': ['BSX', 'WRX'], '103': null, '105': ['BSX', 'WRX'], '122': ['WRX', 'BSX'], '201': ['GBB-VBR', 'BSX'], '221': ['GBB-VBR', 'BSX'], '261': ['GBB-VBR', 'BSX'], '281': ['GBB-VBR', 'BSX'], '301': ['BSX', 'BSX'], '311': null, '412': ['BSX', 'BSX'], '551': ['GBB-VNG', 'BSX'], '561': ['BSX', 'GBB-BSA'], '701': ['BSX', 'GBB-INV'], '702': ['GBB-INV', 'BSX'] };
  if (!(movement in keys)) return { ok: false, error: 'Movement type tidak didukung.' };
  if ((movement === '221' || movement === '281') && !wbs.trim()) return { ok: false, error: 'KI 235: WBS wajib diisi.' };
  const entry = keys[movement];
  if (!entry) { result.description = movement === '103' ? 'Penerimaan blocked stock tidak membentuk jurnal FI.' : 'Transfer lokasi penyimpanan tidak membentuk jurnal FI.'; return { ok: true, value: result }; }
  if (movement === '412') {
    if (!wbs.trim()) return { ok: false, error: 'KI 235: WBS wajib diisi untuk stok Q.' };
    result.lines = [
      { account: '114015', label: 'Stok proyek Q', side: 'DEBIT', amount, postingKey: '89', obyc: 'BSX', wbs },
      { account: '114010', label: 'Stok umum', side: 'CREDIT', amount, postingKey: '99', obyc: 'BSX' },
    ];
    result.description = 'Transfer stok umum ke stok proyek Q; pratinjau tidak mengubah saldo.';
    return { ok: true, value: result };
  }
  const [debit, credit] = entry;
  const make = (key: ObycKey, side: 'DEBIT' | 'CREDIT'): JournalLine => ({ account: resolveObycAccount(key, projectStock && key === 'BSX'), label: key, side, amount, postingKey: key === 'BSX' ? (side === 'DEBIT' ? '89' : '99') : key === 'WRX' ? (side === 'DEBIT' ? '86' : '96') : (side === 'DEBIT' ? '40' : '50'), obyc: key, wbs: key === 'GBB-VBR' && wbs ? wbs : undefined });
  result.lines = [make(debit, 'DEBIT'), make(credit, 'CREDIT')];
  result.description = 'Jurnal pendidikan berdasarkan nilai yang dimasukkan; bukan posting ke SAP.';
  return { ok: true, value: result };
}
