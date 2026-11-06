export type SapEdition = 'S4' | 'ECC';
export type Side = 'DEBIT' | 'CREDIT';
export type PriceControl = 'V' | 'S';
export type ObycKey = 'BSX' | 'WRX' | 'GBB-VBR' | 'GBB-VNG' | 'GBB-INV' | 'GBB-BSA' | 'PRD' | 'FR1' | 'KDM';
export interface JournalLine { account: string; label: string; side: Side; amount: bigint; postingKey: string; obyc?: ObycKey; specialGl?: string; wbs?: string; costCenter?: string; order?: string; network?: string }
export interface Journal { id: string; tcode: string; type: string; lines: JournalLine[]; description: string }
export interface Budget { id: string; label: string; released: bigint; pr: bigint; po: bigint; heldQ: bigint; actual: bigint }
export interface AvacResult { assigned: bigint; available: bigint; percent: number; status: 'OK' | 'WARNING' | 'ERROR' }
export interface Asset { id: string; assetClass: '8000' | '2000' | '3000'; value: bigint; depreciation: bigint; months: number; elapsedMonths?: number }
export interface SapState { budgets: Budget[]; journals: Journal[]; assets: Asset[]; caseAction: number; caseStatus: string; stockQ: bigint; stockGeneral: bigint; tables: Record<string, Record<string, string>[]>; error: string | null }
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
export interface CaseAction { step: number; id: string; title: string; tcode: string; description: string }
export type SimTrack = 'infra' | 'sales';
export interface SalesCaseAction { step: number; id: string; title: string; tcode: string; description: string }
export interface SalesState { salesAction: number; status: string; contractValue: bigint; receivables: bigint; revenueMrc: bigint; revenueOtc: bigint; taxOutput: bigint; cashCollected: bigint; journals: Journal[]; tables: Record<string, Record<string, string>[]>; error: string | null }
export type ArSettlementMode = 'partial' | 'residual' | 'full';
export type ArCreditStatus = 'NOT_CHECKED' | 'APPROVED' | 'BLOCKED';
export interface ArItem {
  id: string;
  customer: string;
  documentType: 'DR' | 'RV' | 'DZ';
  amount: bigint;
  remaining: bigint;
  dueDate: string;
  status: 'OPEN' | 'CLEARED';
}
export interface FiArState {
  invoice: { id: string; customer: string; net: bigint; tax: bigint; gross: bigint; dueDate: string } | null;
  openItems: ArItem[];
  clearedItems: ArItem[];
  journals: Journal[];
  lastPayment: { mode: ArSettlementMode; cash: bigint; withholding: bigint; applied: bigint; residual: bigint } | null;
  dunningLevel: number;
  dunningEligible: boolean;
  creditLimit: bigint;
  salesExposure: bigint;
  creditExposure: bigint;
  creditStatus: ArCreditStatus;
  error: string | null;
}
