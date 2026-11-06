import type { ArSettlementMode, FiArState, Journal, JournalLine, Result } from '../types/sap';

const RECEIVABLE = '113010';
const BANK = '111020';
const PREPAID_TAX = '115030';
const REVENUE = '410010';
const OUTPUT_TAX = '215010';
function journal(id: string, tcode: string, type: string, description: string, lines: JournalLine[]): Journal {
  return { id, tcode, type, description, lines };
}

function taxAmount(net: bigint, rate: number): bigint {
  return (net * BigInt(Math.round(rate * 100))) / 10000n;
}

function addDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

export function initialFiArState(): FiArState {
  return {
    invoice: null,
    openItems: [],
    clearedItems: [],
    journals: [],
    lastPayment: null,
    dunningLevel: 0,
    dunningEligible: false,
    creditLimit: 1000000n,
    salesExposure: 0n,
    creditExposure: 0n,
    creditStatus: 'NOT_CHECKED',
    error: null,
  };
}

export interface CustomerInvoiceInput {
  customer: string;
  net: bigint;
  taxRate: number;
  invoiceDate: string;
  dueDays: number;
}

export function postCustomerInvoice(state: FiArState, input: CustomerInvoiceInput): Result<FiArState> {
  if (state.invoice) return { ok: false, error: 'Invoice FI-AR sudah ada. Reset lab sebelum membuat invoice baru.' };
  if (!input.customer.trim()) return { ok: false, error: 'Customer wajib diisi.' };
  if (input.net <= 0n || !Number.isFinite(input.taxRate) || input.taxRate < 0 || input.taxRate > 100) return { ok: false, error: 'Nilai net harus positif dan tarif pajak harus 0–100%.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.invoiceDate) || !Number.isInteger(input.dueDays) || input.dueDays < 0 || input.dueDays > 365) return { ok: false, error: 'Tanggal invoice atau umur jatuh tempo tidak valid.' };
  const tax = taxAmount(input.net, input.taxRate);
  const gross = input.net + tax;
  const invoice = { id: '18000001', customer: input.customer.trim(), net: input.net, tax, gross, dueDate: addDays(input.invoiceDate, input.dueDays) };
  const lines: JournalLine[] = [
    { account: RECEIVABLE, label: `Piutang pelanggan ${invoice.customer}`, side: 'DEBIT', amount: gross, postingKey: '01' },
    { account: REVENUE, label: 'Pendapatan jasa internet / invoice manual', side: 'CREDIT', amount: input.net, postingKey: '50' },
  ];
  if (tax > 0n) lines.push({ account: OUTPUT_TAX, label: 'PPN keluaran', side: 'CREDIT', amount: tax, postingKey: '50' });
  return {
    ok: true,
    value: {
      ...state,
      invoice,
      openItems: [{ id: invoice.id, customer: invoice.customer, documentType: 'DR', amount: gross, remaining: gross, dueDate: invoice.dueDate, status: 'OPEN' }],
      journals: [...state.journals, journal('AR-DR-0001', 'FB70', 'DR', 'Customer invoice posted to FI-AR', lines)],
      error: null,
    },
  };
}

export interface IncomingPaymentInput {
  mode: ArSettlementMode;
  cash: bigint;
  withholding: bigint;
}

export function postIncomingPayment(state: FiArState, input: IncomingPaymentInput): Result<FiArState> {
  const item = state.openItems[0];
  if (!item) return { ok: false, error: 'Belum ada open item pelanggan. Posting FB70 terlebih dahulu.' };
  if (input.cash < 0n || input.withholding < 0n) return { ok: false, error: 'Kas dan withholding tidak boleh negatif.' };
  const applied = input.cash + input.withholding;
  if (applied <= 0n) return { ok: false, error: 'Pembayaran harus lebih besar dari nol.' };
  if (applied > item.remaining) return { ok: false, error: 'Total pembayaran melebihi saldo piutang terbuka.' };
  if (input.mode === 'full' && applied !== item.remaining) return { ok: false, error: 'Mode full clearing harus membayar seluruh saldo piutang.' };
  const residual = item.remaining - applied;
  const lines: JournalLine[] = [];
  if (input.cash > 0n) lines.push({ account: BANK, label: 'Kas/bank masuk', side: 'DEBIT', amount: input.cash, postingKey: '50' });
  if (input.withholding > 0n) lines.push({ account: PREPAID_TAX, label: 'Uang muka pajak withholding pelanggan', side: 'DEBIT', amount: input.withholding, postingKey: '40' });
  lines.push({ account: RECEIVABLE, label: `Clearing piutang ${item.id}`, side: 'CREDIT', amount: applied, postingKey: '15' });
  const cleared = { ...item, remaining: 0n, status: 'CLEARED' as const };
  const nextOpen = input.mode === 'residual'
    ? (residual > 0n ? [{ ...item, id: `${item.id}-R1`, amount: residual, remaining: residual, status: 'OPEN' as const }] : [])
    : (residual > 0n ? [{ ...item, remaining: residual }] : []);
  return {
    ok: true,
    value: {
      ...state,
      openItems: nextOpen,
      clearedItems: input.mode === 'partial' ? state.clearedItems : [...state.clearedItems, cleared],
      journals: [...state.journals, journal('AR-DZ-0001', 'F-28', 'DZ', `${input.mode === 'partial' ? 'Partial payment' : input.mode === 'residual' ? 'Residual item clearing' : 'Full clearing'} untuk customer ${item.customer}`, lines)],
      lastPayment: { mode: input.mode, cash: input.cash, withholding: input.withholding, applied, residual },
      error: null,
    },
  };
}

export function runDunning(state: FiArState, runDate: string, level: number): Result<FiArState> {
  if (!state.invoice || !/^\d{4}-\d{2}-\d{2}$/.test(runDate) || !Number.isInteger(level) || level < 1 || level > 4) return { ok: false, error: 'Dunning memerlukan invoice, tanggal run valid, dan level 1–4.' };
  const eligible = state.openItems.some(item => item.dueDate < runDate && item.remaining > 0n);
  return { ok: true, value: { ...state, dunningLevel: eligible ? level : 0, dunningEligible: eligible, error: null } };
}

export function checkCredit(state: FiArState, creditLimit: bigint, salesExposure: bigint): Result<FiArState> {
  if (creditLimit < 0n || salesExposure < 0n) return { ok: false, error: 'Credit limit dan sales exposure tidak boleh negatif.' };
  const open = state.openItems.reduce((sum, item) => sum + item.remaining, 0n);
  const exposure = open + salesExposure;
  return { ok: true, value: { ...state, creditLimit, salesExposure, creditExposure: exposure, creditStatus: exposure <= creditLimit ? 'APPROVED' : 'BLOCKED', error: null } };
}

export function projectFiArTables(state: FiArState): Record<string, Record<string, string>[]> {
  const itemRow = (item: FiArState['openItems'][number]) => ({ KUNNR: item.customer, BELNR: item.id, BLART: item.documentType, DMBTR: `$${(Number(item.amount) / 100).toFixed(2)}`, REST: `$${(Number(item.remaining) / 100).toFixed(2)}`, ZFBDT: item.dueDate, STATUS: item.status });
  return {
    BSID: state.openItems.map(itemRow),
    BSAD: state.clearedItems.map(itemRow),
    KNB1: state.invoice ? [{ KUNNR: state.invoice.customer, BUKRS: '1000', AKONT: RECEIVABLE, ZTERM: 'Z030' }] : [],
    KNKK: state.invoice ? [{ KUNNR: state.invoice.customer, KLIMK: `$${(Number(state.creditLimit) / 100).toFixed(2)}`, KLIME: `$${(Number(state.creditExposure) / 100).toFixed(2)}`, CMPSA: state.creditStatus }] : [],
  };
}

export function isJournalBalanced(item: Journal): boolean {
  const debit = item.lines.filter(line => line.side === 'DEBIT').reduce((sum, line) => sum + line.amount, 0n);
  const credit = item.lines.filter(line => line.side === 'CREDIT').reduce((sum, line) => sum + line.amount, 0n);
  return debit === credit;
}
