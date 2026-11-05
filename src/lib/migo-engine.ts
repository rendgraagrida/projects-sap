import type { Journal, JournalLine, ObycKey, Result } from '../types/sap';
import { resolveObycAccount } from './sap-engine';

export interface MigoInput { movement: string; amount: bigint; projectStock: boolean; wbs: string; costCenter?: string; order?: string; network?: string }
export function simulateMigo(input: MigoInput): Result<Journal> {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Input movement tidak valid.' };
  const { movement, amount, projectStock, wbs } = input;
  if (typeof amount !== 'bigint' || amount <= 0n || amount > 1_000_000_000_000_000n) return { ok: false, error: 'Nilai harus positif dan dalam batas lab.' };
  if (typeof wbs !== 'string' || typeof projectStock !== 'boolean') return { ok: false, error: 'Input stok atau WBS tidak valid.' };
  const result: Journal = { id: 'SANDBOX', tcode: `MIGO ${movement}${projectStock ? ' Q' : ''}`, type: 'WA', description: '', lines: [] };
  const keys: Record<string, [ObycKey, ObycKey] | null> = { '101': ['BSX', 'WRX'], '103': null, '105': ['BSX', 'WRX'], '122': ['WRX', 'BSX'], '201': ['GBB-VBR', 'BSX'], '221': ['GBB-VBR', 'BSX'], '261': ['GBB-VBR', 'BSX'], '281': ['GBB-VBR', 'BSX'], '301': ['BSX', 'BSX'], '311': null, '411': ['BSX', 'BSX'], '412': ['BSX', 'BSX'], '551': ['GBB-VNG', 'BSX'], '561': ['BSX', 'GBB-BSA'], '701': ['BSX', 'GBB-INV'], '702': ['GBB-INV', 'BSX'] };
  if (!Object.hasOwn(keys, movement)) return { ok: false, error: 'Movement type tidak didukung.' };
  if (projectStock && !['101', '103', '105', '122', '201', '221', '261', '281', '311', '411', '412', '551', '561', '701', '702'].includes(movement)) return { ok: false, error: 'Kombinasi movement dan stok Q tidak didukung lab.' };
  if ((projectStock || movement === '221' || movement === '281' || movement === '411' || movement === '412') && !wbs.trim()) return { ok: false, error: 'KI 235: WBS wajib diisi.' };
  if (movement === '201' && (typeof input.costCenter !== 'string' || !input.costCenter.trim())) return { ok: false, error: 'Cost center wajib diisi.' };
  if (movement === '261' && (typeof input.order !== 'string' || !input.order.trim())) return { ok: false, error: 'Order wajib diisi.' };
  if (movement === '281' && (typeof input.network !== 'string' || !input.network.trim())) return { ok: false, error: 'Network wajib diisi.' };
  if ((movement === '411' || movement === '412') && !projectStock) return { ok: false, error: 'Transfer ini memerlukan indikator stok proyek Q.' };
  const entry = keys[movement];
  if (!entry) { result.description = movement === '103' ? 'GR blocked stock nonvaluated tidak membentuk jurnal FI dalam preview.' : 'Transfer lokasi penyimpanan dalam satu plant tidak membentuk jurnal FI dalam preview.'; return { ok: true, value: result }; }
  if (movement === '411' || movement === '412') {
    const toProject = movement === '412';
    result.lines = [
      { account: toProject ? '114015' : '114010', label: toProject ? 'Stok proyek Q' : 'Stok umum', side: 'DEBIT', amount, postingKey: '89', obyc: 'BSX', ...(toProject ? { wbs } : {}) },
      { account: toProject ? '114010' : '114015', label: toProject ? 'Stok umum' : 'Stok proyek Q', side: 'CREDIT', amount, postingKey: '99', obyc: 'BSX', ...(!toProject ? { wbs } : {}) },
    ];
    result.description = toProject ? '412 Q: pembalikan transfer ke stok umum, dari stok umum ke stok proyek; preview tidak mengubah saldo.' : '411 Q: transfer stok proyek ke stok umum; preview tidak mengubah saldo.';
    return { ok: true, value: result };
  }
  const [debit, credit] = entry;
  const make = (key: ObycKey, side: 'DEBIT' | 'CREDIT'): JournalLine => ({ account: resolveObycAccount(key, projectStock && key === 'BSX'), label: key, side, amount, postingKey: key === 'BSX' ? (side === 'DEBIT' ? '89' : '99') : key === 'WRX' ? (side === 'DEBIT' ? '86' : '96') : (side === 'DEBIT' ? '40' : '50'), obyc: key, wbs: (key === 'GBB-VBR' && ['221', '281'].includes(movement) || projectStock && key === 'BSX') && wbs ? wbs : undefined, costCenter: key === 'GBB-VBR' && movement === '201' ? input.costCenter?.trim() : undefined, order: key === 'GBB-VBR' && movement === '261' ? input.order?.trim() : undefined, network: key === 'GBB-VBR' && movement === '281' ? input.network?.trim() : undefined });
  result.lines = [make(debit, 'DEBIT'), make(credit, 'CREDIT')];
  result.description = movement === '301' ? 'Contoh transfer antar-plant dengan posting bernilai; hasil aktual bergantung area valuasi dan konfigurasi. Tidak mengubah saldo.' : 'Jurnal pendidikan bernilai berdasarkan input; bukan posting SAP atau validasi dokumen dan saldo.';
  return { ok: true, value: result };
}
