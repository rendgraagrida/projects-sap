import { accounts, taxCodes } from '../data/sap-config';
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
  const next = { ...budget, pr: budget.pr + (delta.pr ?? 0n), po: budget.po + (delta.po ?? 0n), heldQ: budget.heldQ + (delta.heldQ ?? 0n), actual: budget.actual + (delta.actual ?? 0n) };
  if ([next.pr, next.po, next.heldQ, next.actual].some(n => n < 0n)) return { ok: false, error: 'Komitmen atau biaya tidak boleh negatif.' };
  if (calculateAvac(next).status === 'ERROR') return { ok: false, error: `BP 604 Budget Exceeded: ${budget.id}` };
  return { ok: true, value: next };
}
const line = (account: string, label: string, side: 'DEBIT' | 'CREDIT', amount: bigint, postingKey: string, obyc?: ObycKey, wbs?: string, specialGl?: string): JournalLine => ({ account, label, side, amount, postingKey, obyc, wbs, specialGl });
export function initialSapState(): SapState {
  return { budgets: [{ id: 'P-2026-GI01.01', label: 'Sipil', released: 0n, pr: 0n, po: 0n, heldQ: 0n, actual: 0n }, { id: 'P-2026-GI01.02', label: 'Trafo & kabel', released: 0n, pr: 0n, po: 0n, heldQ: 0n, actual: 0n }], journals: [], assets: [], caseAction: 0, caseStatus: 'CRTD', stockQ: 0n, stockGeneral: 500000n, tables: {}, error: null };
}
export function executeCaseAction(previous: SapState): Result<SapState> {
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
    case 'po-trafo': error = change(1, { po: 5000000n }); state.tables.EKKO = [{ EBELN: '4500010001', LIFNR: '100024' }]; state.tables.EKPO = [{ EBELN: '4500010001', NETWR: '50000', KNTTP: 'Q' }]; state.tables.EKKN = [{ EBELN: '4500010001', WBS: w2 }]; break;
    case 'po-service': error = change(0, { po: 3500000n }); state.tables.EKKO.push({ EBELN: '4500010002', LIFNR: '100025' }); state.tables.EKPO.push({ EBELN: '4500010002', NETWR: '35000', KNTTP: 'P', PSTYP: 'D' }); state.tables.EKKN.push({ EBELN: '4500010002', WBS: w1 }); break;
    case 'dp': type = 'KZ'; lines = [line('116010', 'Uang muka vendor', 'DEBIT', 700000n, '29', undefined, undefined, 'A'), line('111020', 'Bank', 'CREDIT', 700000n, '50')]; break;
    case 'gr-q': error = change(1, { po: -5000000n, heldQ: 5000000n }); state.stockQ += 5000000n; lines = [line('114015', 'Stok proyek', 'DEBIT', 5000000n, '89', 'BSX'), line('210090', 'GR/IR', 'CREDIT', 5000000n, '96', 'WRX')]; break;
    case 'gi-q': error = change(1, { heldQ: -5000000n, actual: 5000000n }); state.stockQ -= 5000000n; type = 'WA'; lines = [line('510010', 'Biaya material', 'DEBIT', 5000000n, '40', 'GBB-VBR', w2), line('114015', 'Stok proyek', 'CREDIT', 5000000n, '99', 'BSX')]; break;
    case 'gi-cable': error = change(1, { actual: 500000n }); state.stockGeneral -= 500000n; type = 'WA'; lines = [line('510010', 'Biaya material', 'DEBIT', 500000n, '40', 'GBB-VBR', w2), line('114010', 'Stok umum', 'CREDIT', 500000n, '99', 'BSX')]; break;
    case 'ses': error = change(0, { po: -3500000n, actual: 3500000n }); lines = [line('510020', 'Biaya jasa', 'DEBIT', 3500000n, '40', undefined, w1), line('210095', 'GR/IR jasa', 'CREDIT', 3500000n, '96', 'WRX')]; break;
    case 'invoice-trafo': type = 'RE'; lines = [line('210090', 'GR/IR', 'DEBIT', 5000000n, '86', 'WRX'), line('115010', 'PPN masukan', 'DEBIT', 550000n, '40'), line('210010', 'Vendor 100024', 'CREDIT', 5550000n, '31')]; break;
    case 'invoice-service': type = 'RE'; lines = [line('210095', 'GR/IR jasa', 'DEBIT', 3500000n, '86', 'WRX'), line('115010', 'PPN masukan', 'DEBIT', 385000n, '40'), line('210010', 'Vendor 100025', 'CREDIT', 3815000n, '31'), line('213023', 'PPh 23', 'CREDIT', 70000n, '50')]; break;
    case 'clear-dp': type = 'AB'; lines = [line('210010', 'Vendor', 'DEBIT', 700000n, '26'), line('116010', 'Uang muka', 'CREDIT', 700000n, '39', undefined, undefined, 'A')]; break;
    case 'pay': type = 'KZ'; lines = [line('210010', 'Vendor 100024', 'DEBIT', 5550000n, '25'), line('210010', 'Vendor 100025', 'DEBIT', 3115000n, '25'), line('111020', 'Bank', 'CREDIT', 8665000n, '50')]; break;
    case 'periodic': type = 'AA'; state.assets[0].value = 3500000n; state.assets[1].value = 5500000n; lines = [line('129010', 'AuC sipil', 'DEBIT', 3500000n, '70'), line('129010', 'AuC trafo', 'DEBIT', 5500000n, '70'), line('599010', 'Settlement sipil', 'CREDIT', 3500000n, '50', undefined, w1), line('599010', 'Settlement trafo', 'CREDIT', 5500000n, '50', undefined, w2)]; break;
    case 'full': type = 'AA'; state.caseStatus = 'TECO'; state.assets[0].value = 0n; state.assets[1].value = 0n; state.assets.push({ id: '2000099-0', assetClass: '2000', value: 3500000n, depreciation: 0n, months: 240 }, { id: '3000099-0', assetClass: '3000', value: 5500000n, depreciation: 0n, months: 120 }); lines = [line('121020', 'Bangunan', 'DEBIT', 3500000n, '70'), line('121030', 'Trafo', 'DEBIT', 5500000n, '70'), line('129010', 'AuC sipil', 'CREDIT', 3500000n, '75'), line('129010', 'AuC trafo', 'CREDIT', 5500000n, '75')]; break;
    case 'depreciate': type = 'AF'; state.assets[2].depreciation = 14583n; state.assets[3].depreciation = 45833n; lines = [line('610010', 'Beban penyusutan', 'DEBIT', 60416n, '40'), line('122020', 'Akumulasi bangunan', 'CREDIT', 14583n, '75'), line('122030', 'Akumulasi trafo', 'CREDIT', 45833n, '75')]; break;
  }
  if (error) return { ok: false, error };
  if (lines.length) state.journals.push({ id: String(5000000000 + state.journals.length), tcode: action.tcode, type, lines, description: action.title });
  state.caseAction++;
  return { ok: true, value: state };
}
export interface MiroInput { grValue: bigint; invoiceValue: bigint; stockCoveragePercent: number; priceControl: PriceControl; fxDifference: bigint; taxCode: keyof typeof taxCodes; withholding: boolean }
export function simulateMiro(input: MiroInput): Result<Journal> {
  const { grValue, invoiceValue, stockCoveragePercent, priceControl, fxDifference, taxCode, withholding } = input;
  if (grValue <= 0n || invoiceValue < 0n || stockCoveragePercent < 0 || stockCoveragePercent > 100 || !Number.isInteger(stockCoveragePercent)) return { ok: false, error: 'Nilai dan persentase coverage tidak valid.' };
  if (taxCodes[taxCode].kind !== 'INPUT') return { ok: false, error: 'A1 adalah PPN keluaran dan tidak digunakan untuk invoice pembelian MIRO.' };
  const priceDifference = invoiceValue - grValue;
  const tax = roundRatio(invoiceValue * BigInt(taxCodes[taxCode].rate), 100n);
  const withheld = withholding ? roundRatio(invoiceValue * 2n, 100n) : 0n;
  const stockDifference = priceControl === 'V' ? roundRatio(priceDifference * BigInt(stockCoveragePercent), 100n) : 0n;
  const expenseDifference = priceDifference - stockDifference;
  const lines = [line('210090', 'GR/IR', 'DEBIT', grValue, '86', 'WRX')];
  const signed = (value: bigint, account: string, label: string, key?: ObycKey) => { if (value !== 0n) lines.push(line(account, label, value > 0n ? 'DEBIT' : 'CREDIT', value > 0n ? value : -value, value > 0n ? '40' : '50', key)); };
  signed(stockDifference, '114010', 'Selisih harga stok', 'BSX'); signed(expenseDifference, '520010', 'Selisih harga', 'PRD'); signed(fxDifference, '710020', 'Selisih kurs', 'KDM');
  if (tax && taxCodes[taxCode].deductible) lines.push(line('115010', 'PPN masukan', 'DEBIT', tax, '40'));
  else if (tax) {
    const stockTax = priceControl === 'V' ? roundRatio(tax * BigInt(stockCoveragePercent), 100n) : 0n;
    signed(stockTax, '114010', 'PPN non-deductible ke stok', 'BSX');
    signed(tax - stockTax, '520010', 'PPN non-deductible ke biaya', 'PRD');
  }
  if (withheld) lines.push(line('213023', 'PPh 23', 'CREDIT', withheld, '50'));
  const payable = invoiceValue + fxDifference + tax - withheld;
  if (payable < 0n) return { ok: false, error: 'Hutang vendor tidak boleh negatif.' };
  lines.push(line('210010', 'Vendor', 'CREDIT', payable, '31'));
  return { ok: true, value: { id: 'SANDBOX', tcode: 'MIRO', type: 'RE', description: (priceDifference < 0n ? -priceDifference : priceDifference) * 100n > grValue * 5n ? 'Payment Block R: selisih harga melebihi 5%' : '3-way match', lines } };
}
export interface ParsedCommand { mode: 'replace' | 'new' | 'menu' | 'end' | 'exit'; tcode: string }
export function parseTCodeCommand(raw: string): Result<ParsedCommand> {
  const text = raw.trim().toUpperCase();
  if (text === '/N') return { ok: true, value: { mode: 'menu', tcode: '' } };
  if (text === '/NEND' || text === '/NEX') return { ok: true, value: { mode: text === '/NEND' ? 'end' : 'exit', tcode: '' } };
  const match = /^(?:\/(N|O))?([A-Z][A-Z0-9_.-]*)$/.exec(text);
  if (!match) return { ok: false, error: 'Perintah SAP tidak valid.' };
  return { ok: true, value: { mode: match[1] === 'O' ? 'new' : 'replace', tcode: match[2] } };
}
