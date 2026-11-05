import { accounts, taxCodes, withholding as withholdingConfig } from '../data/sap-config';
import { caseActions } from '../data/capex-case';
import type { AvacResult, Budget, Journal, JournalLine, ObycKey, PriceControl, Result, SapState } from '../types/sap';
import { roundRatio } from './sap-money';

export function resolveObycAccount(key: ObycKey, projectStock = false): string { return key === 'BSX' && projectStock ? '114015' : accounts[key]; }
export function calculateAvac(budget: Budget): AvacResult {
  const assigned = budget.pr + budget.po + budget.heldQ + budget.actual;
  const available = budget.released - assigned;
  const percent = budget.released === 0n ? (assigned > 0n ? Infinity : 0) : Number(assigned * 10000n / budget.released) / 100;
  return { assigned, available, percent, status: assigned > budget.released ? 'ERROR' : assigned * 5n >= budget.released * 4n && budget.released > 0n ? 'WARNING' : 'OK' };
}
export function guardBudgetChange(budget: Budget, delta: Partial<Pick<Budget, 'pr' | 'po' | 'heldQ' | 'actual'>>): Result<Budget> {
  if (!budget || !delta || [budget.released, budget.pr, budget.po, budget.heldQ, budget.actual].some(n => typeof n !== 'bigint' || n < 0n || n > 1_000_000_000_000_000n) || [delta.pr, delta.po, delta.heldQ, delta.actual].some(n => n !== undefined && (typeof n !== 'bigint' || n < -1_000_000_000_000_000n || n > 1_000_000_000_000_000n))) return { ok: false, error: 'Anggaran atau perubahan tidak valid.' };
  const next = { ...budget, pr: budget.pr + (delta.pr ?? 0n), po: budget.po + (delta.po ?? 0n), heldQ: budget.heldQ + (delta.heldQ ?? 0n), actual: budget.actual + (delta.actual ?? 0n) };
  if ([next.pr, next.po, next.heldQ, next.actual].some(n => n < 0n || n > 1_000_000_000_000_000n)) return { ok: false, error: 'Komitmen atau biaya di luar batas lab.' };
  if (calculateAvac(next).status === 'ERROR') return { ok: false, error: `BP 604 Budget Exceeded: ${budget.id}` };
  return { ok: true, value: next };
}
const line = (account: string, label: string, side: 'DEBIT' | 'CREDIT', amount: bigint, postingKey: string, obyc?: ObycKey, wbs?: string, specialGl?: string): JournalLine => ({ account, label, side, amount, postingKey, obyc, wbs, specialGl });
export function initialSapState(): SapState {
  return { budgets: [{ id: 'P-2026-TINF01.01', label: 'Site & civil works', released: 0n, pr: 0n, po: 0n, heldQ: 0n, actual: 0n }, { id: 'P-2026-TINF01.02', label: 'Network material', released: 0n, pr: 0n, po: 0n, heldQ: 0n, actual: 0n }], journals: [], assets: [], caseAction: 0, caseStatus: 'CRTD', stockQ: 0n, stockGeneral: 500000n, tables: {}, error: null };
}
// This is a fixed sequential fixture, not a general SAP document store.
function validCaseState(s: SapState): boolean {
  if (!s || !Number.isInteger(s.caseAction) || s.caseAction < 0 || s.caseAction > caseActions.length || !Array.isArray(s.budgets) || s.budgets.length !== 2 || !Array.isArray(s.journals) || !Array.isArray(s.assets) || !s.tables || typeof s.tables !== 'object') return false;
  if (Object.values(s.tables).some(rows => !Array.isArray(rows) || rows.some(row => !row || typeof row !== 'object' || Array.isArray(row)))) return false;
  const n = s.caseAction;
  const expected = [
    { id: 'P-2026-TINF01.01', released: n >= 2 ? 4000000n : 0n, pr: 0n, po: n >= 5 && n < 10 ? 3500000n : 0n, heldQ: 0n, actual: n >= 10 ? 3500000n : 0n },
    { id: 'P-2026-TINF01.02', released: n >= 2 ? 6000000n : 0n, pr: 0n, po: n >= 4 && n < 7 ? 5000000n : 0n, heldQ: n === 7 ? 5000000n : 0n, actual: (n >= 8 ? 5000000n : 0n) + (n >= 9 ? 500000n : 0n) },
  ];
  if (!expected.every((b, i) => s.budgets[i] && Object.entries(b).every(([k, v]) => s.budgets[i][k as keyof Budget] === v))) return false;
  if (s.stockQ !== (n === 7 ? 5000000n : 0n) || s.stockGeneral !== (n >= 9 ? 0n : 500000n)) return false;
  if (s.caseStatus !== (n >= 16 ? 'TECO' : n >= 3 ? 'REL BUDG AVAC AUC' : 'CRTD')) return false;
  const expectedAssets = n >= 16 ? 4 : n >= 3 ? 2 : 0;
  if (s.assets.length !== expectedAssets) return false;
  const ids = ['8000015-0', '8000016-0', '2000099-0', '3000099-0'];
  if (!s.assets.every((a, i) => a && a.id === ids[i] && a.assetClass === (i < 2 ? '8000' : i === 2 ? '2000' : '3000') && a.value === (i < 2 ? n === 15 ? (i === 0 ? 3500000n : 5500000n) : 0n : i === 2 ? 3500000n : 5500000n) && a.depreciation === (n >= 17 && i >= 2 ? i === 2 ? 14583n : 45833n : 0n) && a.months === (i < 2 ? 0 : i === 2 ? 240 : 120) && (a.elapsedMonths ?? 0) === (n >= 17 && i >= 2 ? 1 : 0))) return false;
  const journalActions = caseActions.slice(0, n).filter(a => !['project', 'budget', 'release', 'po-material', 'po-service'].includes(a.id));
  if (s.journals.length !== journalActions.length || !s.journals.every((j, i) => j && j.id === String(5000000000 + i) && j.tcode === journalActions[i].tcode && Array.isArray(j.lines) && j.lines.length > 0 && j.lines.every(l => l && typeof l.amount === 'bigint' && l.amount > 0n && (l.side === 'DEBIT' || l.side === 'CREDIT')) && j.lines.reduce((sum, l) => sum + (l.side === 'DEBIT' ? l.amount : -l.amount), 0n) === 0n)) return false;
  const poCount = n >= 5 ? 2 : n >= 4 ? 1 : 0;
  if (!['EKKO', 'EKPO', 'EKKN'].every(k => poCount === 0 ? s.tables[k] === undefined : Array.isArray(s.tables[k]) && s.tables[k].length === poCount && s.tables[k].every((row, i) => row.EBELN === (i === 0 ? '4500010001' : '4500010002')))) return false;
  return n === 0 ? s.tables.PRPS === undefined : Array.isArray(s.tables.PRPS) && s.tables.PRPS.length === 2 && s.tables.PRPS.every((row, i) => row.POSID === expected[i].id);
}
export function executeCaseAction(previous: SapState): Result<SapState> {
  if (!validCaseState(previous)) return { ok: false, error: 'State kasus tidak konsisten dengan urutan fixture; reset kasus.' };
  const action = caseActions[previous.caseAction];
  if (!action) return { ok: false, error: 'Seluruh langkah telah selesai.' };
  const state: SapState = { ...previous, budgets: previous.budgets.map(b => ({ ...b })), journals: [...previous.journals], assets: previous.assets.map(a => ({ ...a })), tables: Object.fromEntries(Object.entries(previous.tables).map(([k, v]) => [k, [...v]])), error: null };
  let lines: JournalLine[] = [];
  let type = 'WE';
  const w1 = state.budgets[0].id, w2 = state.budgets[1].id;
  const change = (index: number, delta: Partial<Pick<Budget, 'pr' | 'po' | 'heldQ' | 'actual'>>): string | null => {
    const result = guardBudgetChange(state.budgets[index], delta);
    if (!result.ok) return result.error;
    state.budgets[index] = result.value;
    return null;
  };
  let error: string | null = null;
  switch (action.id) {
    case 'project': state.tables.PRPS = state.budgets.map(b => ({ POSID: b.id, STATUS: 'CRTD' })); break;
    case 'budget': state.budgets[0].released = 4000000n; state.budgets[1].released = 6000000n; break;
    case 'release': state.caseStatus = 'REL BUDG AVAC AUC'; state.assets.push({ id: '8000015-0', assetClass: '8000', value: 0n, depreciation: 0n, months: 0 }, { id: '8000016-0', assetClass: '8000', value: 0n, depreciation: 0n, months: 0 }); break;
    case 'po-material': error = change(1, { po: 5000000n }); state.tables.EKKO = [{ EBELN: '4500010001', LIFNR: '100024' }]; state.tables.EKPO = [{ EBELN: '4500010001', MATNR: 'MAT-FO-48C', NETWR: '50000', KNTTP: 'Q' }]; state.tables.EKKN = [{ EBELN: '4500010001', WBS: w2 }]; break;
    case 'po-service': error = change(0, { po: 3500000n }); state.tables.EKKO.push({ EBELN: '4500010002', LIFNR: '100025' }); state.tables.EKPO.push({ EBELN: '4500010002', NETWR: '35000', KNTTP: 'P', PSTYP: 'D' }); state.tables.EKKN.push({ EBELN: '4500010002', WBS: w1 }); break;
    case 'dp': type = 'KZ'; lines = [line('116010', 'Uang muka vendor', 'DEBIT', 700000n, '29', undefined, undefined, 'A'), line('111020', 'Bank', 'CREDIT', 700000n, '50')]; break;
    case 'gr-q': error = change(1, { po: -5000000n, heldQ: 5000000n }); state.stockQ += 5000000n; lines = [line('114015', 'Stok proyek', 'DEBIT', 5000000n, '89', 'BSX'), line('210090', 'GR/IR', 'CREDIT', 5000000n, '96', 'WRX')]; break;
    case 'gi-q': error = change(1, { heldQ: -5000000n, actual: 5000000n }); state.stockQ -= 5000000n; type = 'WA'; lines = [line('510010', 'Biaya material', 'DEBIT', 5000000n, '40', 'GBB-VBR', w2), line('114015', 'Stok proyek', 'CREDIT', 5000000n, '99', 'BSX')]; break;
    case 'gi-cable': error = change(1, { actual: 500000n }); state.stockGeneral -= 500000n; type = 'WA'; lines = [line('510010', 'Biaya material', 'DEBIT', 500000n, '40', 'GBB-VBR', w2), line('114010', 'Stok umum', 'CREDIT', 500000n, '99', 'BSX')]; break;
    case 'ses': error = change(0, { po: -3500000n, actual: 3500000n }); lines = [line('510020', 'Biaya jasa', 'DEBIT', 3500000n, '40', undefined, w1), line('210095', 'GR/IR jasa', 'CREDIT', 3500000n, '96', 'WRX')]; break;
    case 'invoice-material': type = 'RE'; lines = [line('210090', 'GR/IR', 'DEBIT', 5000000n, '86', 'WRX'), line('115010', 'PPN masukan', 'DEBIT', 550000n, '40'), line('210010', 'Vendor 100024', 'CREDIT', 5550000n, '31')]; break;
    case 'invoice-service': type = 'RE'; lines = [line('210095', 'GR/IR jasa', 'DEBIT', 3500000n, '86', 'WRX'), line('115010', 'PPN masukan', 'DEBIT', 385000n, '40'), line('210010', 'Vendor 100025', 'CREDIT', 3815000n, '31'), line('213023', 'PPh 23', 'CREDIT', 70000n, '50')]; break;
    case 'clear-dp': type = 'AB'; lines = [line('210010', 'Vendor', 'DEBIT', 700000n, '26'), line('116010', 'Uang muka', 'CREDIT', 700000n, '39', undefined, undefined, 'A')]; break;
    case 'pay': type = 'KZ'; lines = [line('210010', 'Vendor 100024', 'DEBIT', 5550000n, '25'), line('210010', 'Vendor 100025', 'DEBIT', 3115000n, '25'), line('111020', 'Bank', 'CREDIT', 8665000n, '50')]; break;
    case 'periodic': type = 'AA'; state.assets[0].value = 3500000n; state.assets[1].value = 5500000n; lines = [line('129010', 'AuC site & civil works', 'DEBIT', 3500000n, '70'), line('129010', 'AuC fiber & network', 'DEBIT', 5500000n, '70'), line('599010', 'Settlement site & civil works', 'CREDIT', 3500000n, '50', undefined, w1), line('599010', 'Settlement fiber & network', 'CREDIT', 5500000n, '50', undefined, w2)]; break;
    case 'full': type = 'AA'; state.caseStatus = 'TECO'; state.assets[0].value = 0n; state.assets[1].value = 0n; state.assets.push({ id: '2000099-0', assetClass: '2000', value: 3500000n, depreciation: 0n, months: 240 }, { id: '3000099-0', assetClass: '3000', value: 5500000n, depreciation: 0n, months: 120 }); lines = [line('121020', 'Network site & civil works', 'DEBIT', 3500000n, '70'), line('121030', 'Fiber & network equipment', 'DEBIT', 5500000n, '70'), line('129010', 'AuC site & civil works', 'CREDIT', 3500000n, '75'), line('129010', 'AuC fiber & network', 'CREDIT', 5500000n, '75')]; break;
    case 'depreciate': type = 'AF'; state.assets[2].depreciation = 14583n; state.assets[2].elapsedMonths = 1; state.assets[3].depreciation = 45833n; state.assets[3].elapsedMonths = 1; lines = [line('610010', 'Beban penyusutan', 'DEBIT', 60416n, '40'), line('122020', 'Akumulasi network site', 'CREDIT', 14583n, '75'), line('122030', 'Akumulasi fiber & network', 'CREDIT', 45833n, '75')]; break;
  }
  if (error) return { ok: false, error };
  if (lines.length) state.journals.push({ id: String(5000000000 + state.journals.length), tcode: action.tcode, type, lines, description: action.title });
  state.caseAction++;
  return { ok: true, value: state };
}
export interface MiroInput { grValue: bigint; invoiceValue: bigint; stockCoveragePercent: number; priceControl: PriceControl; fxDifference: bigint; taxCode: keyof typeof taxCodes; withholding: boolean }
export function simulateMiro(input: MiroInput): Result<Journal> {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Input invoice tidak valid.' };
  const { grValue, invoiceValue, stockCoveragePercent, priceControl, fxDifference, taxCode, withholding } = input;
  const max = 1_000_000_000_000_000n;
  if (typeof grValue !== 'bigint' || typeof invoiceValue !== 'bigint' || typeof fxDifference !== 'bigint' || grValue <= 0n || grValue > max || invoiceValue <= 0n || invoiceValue > max || fxDifference < -max || fxDifference > max || !Number.isInteger(stockCoveragePercent) || stockCoveragePercent < 0 || stockCoveragePercent > 100 || (priceControl !== 'V' && priceControl !== 'S') || typeof withholding !== 'boolean' || typeof taxCode !== 'string' || !Object.hasOwn(taxCodes, taxCode)) return { ok: false, error: 'Nilai, kurs, coverage, price control atau kode pajak tidak valid.' };
  if (taxCodes[taxCode].kind !== 'INPUT') return { ok: false, error: 'Pajak keluaran tidak digunakan untuk invoice pembelian MIRO.' };
  const priceDifference = invoiceValue - grValue;
  const tax = roundRatio(invoiceValue * BigInt(taxCodes[taxCode].rate), 100n);
  const withheld = withholding ? roundRatio(invoiceValue * BigInt(withholdingConfig.percent), 100n) : 0n;
  const stockDifference = priceControl === 'V' ? roundRatio(priceDifference * BigInt(stockCoveragePercent), 100n) : 0n;
  const expenseDifference = priceDifference - stockDifference;
  const lines = [line('210090', 'GR/IR', 'DEBIT', grValue, '86', 'WRX')];
  const signed = (value: bigint, account: string, label: string, key?: ObycKey) => { if (value !== 0n) lines.push(line(account, label, value > 0n ? 'DEBIT' : 'CREDIT', value > 0n ? value : -value, key === 'BSX' ? (value > 0n ? '89' : '99') : (value > 0n ? '40' : '50'), key)); };
  signed(stockDifference, '114010', 'Selisih harga stok', 'BSX'); signed(expenseDifference, '520010', 'Selisih harga', 'PRD'); signed(fxDifference, '710020', 'Selisih kurs', 'KDM');
  if (tax && taxCodes[taxCode].deductible) lines.push(line('115010', 'PPN masukan', 'DEBIT', tax, '40'));
  else if (tax) {
    const stockTax = priceControl === 'V' ? roundRatio(tax * BigInt(stockCoveragePercent), 100n) : 0n;
    signed(stockTax, '114010', 'PPN non-deductible ke stok', 'BSX');
    signed(tax - stockTax, '520010', 'PPN non-deductible ke biaya', 'PRD');
  }
  if (withheld) lines.push(line(withholdingConfig.account, withholdingConfig.name, 'CREDIT', withheld, '50'));
  const payable = invoiceValue + fxDifference + tax - withheld;
  if (payable < 0n || payable > max) return { ok: false, error: 'Hutang vendor di luar batas lab.' };
  if (payable > 0n) lines.push(line('210010', 'Vendor', 'CREDIT', payable, '31'));
  return { ok: true, value: { id: 'SANDBOX', tcode: 'MIRO', type: 'RE', description: 'Pratinjau jurnal dengan kebijakan pajak dan alokasi lab; bukan 3-way match atau pemeriksaan payment block.', lines } };
}
export interface ParsedCommand { mode: 'replace' | 'new' | 'menu' | 'end' | 'exit' | 'close'; tcode: string }
export function parseTCodeCommand(raw: string): Result<ParsedCommand> {
  if (typeof raw !== 'string') return { ok: false, error: 'Perintah SAP tidak valid.' };
  const text = raw.trim().toUpperCase();
  if (text === '/N') return { ok: true, value: { mode: 'menu', tcode: '' } };
  if (text === '/NEND' || text === '/NEX') return { ok: true, value: { mode: text === '/NEND' ? 'end' : 'exit', tcode: '' } };
  if (text === '/I') return { ok: true, value: { mode: 'close', tcode: '' } };
  const match = /^(?:\/(N|O))?([A-Z][A-Z0-9_.-]*)$/.exec(text);
  if (!match) return { ok: false, error: 'Perintah SAP tidak valid.' };
  return { ok: true, value: { mode: match[1] === 'O' ? 'new' : 'replace', tcode: match[2] } };
}
