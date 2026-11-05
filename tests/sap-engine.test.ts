import { describe, expect, test } from 'bun:test';
import {
  calculateAvac,
  executeCaseAction,
  guardBudgetChange,
  initialSapState,
  resolveObycAccount,
  simulateMiro,
} from '../src/lib/sap-engine';
import { simulateMigo } from '../src/lib/migo-engine';
import { calculateDepreciation, convertCommitment, settleProject } from '../src/lib/project-engine';
import { projectSapTables } from '../src/lib/sap-tables';
import { formatMoney, parseMoney, roundRatio } from '../src/lib/sap-money';
import { accounts, postingKeys } from '../src/data/sap-config';
import { caseActions } from '../src/data/capex-case';
import type { Budget, SapState } from '../src/types/sap';

describe('SAP OBYC Account Determination & Configuration', () => {
  test('resolves standard OBYC keys to configured G/L accounts', () => {
    expect(resolveObycAccount('BSX', false)).toBe(accounts.BSX); // 114010 - General stock
    expect(resolveObycAccount('BSX', true)).toBe('114015');      // 114015 - Project stock Q
    expect(resolveObycAccount('WRX')).toBe(accounts.WRX);        // 210090 - GR/IR
    expect(resolveObycAccount('GBB-VBR')).toBe(accounts['GBB-VBR']); // 510010 - Consumption
    expect(resolveObycAccount('GBB-VNG')).toBe(accounts['GBB-VNG']); // 510090 - Scrap expense
    expect(resolveObycAccount('GBB-INV')).toBe(accounts['GBB-INV']); // 510080 - Inventory difference
    expect(resolveObycAccount('GBB-BSA')).toBe(accounts['GBB-BSA']); // 399999 - Initial upload offset
    expect(resolveObycAccount('PRD')).toBe(accounts.PRD);        // 520010 - Price difference
    expect(resolveObycAccount('FR1')).toBe(accounts.FR1);        // 210098 - Freight
    expect(resolveObycAccount('KDM')).toBe(accounts.KDM);        // 710020 - FX difference
  });

  test('projectStock flag only overrides BSX account', () => {
    expect(resolveObycAccount('WRX', true)).toBe(accounts.WRX);
    expect(resolveObycAccount('GBB-VBR', true)).toBe(accounts['GBB-VBR']);
    expect(resolveObycAccount('PRD', true)).toBe(accounts.PRD);
    expect(resolveObycAccount('KDM', true)).toBe(accounts.KDM);
  });

  test('posting keys match standard SAP conventions', () => {
    expect(postingKeys.glDebit).toBe('40');
    expect(postingKeys.glCredit).toBe('50');
    expect(postingKeys.stockDebit).toBe('89');
    expect(postingKeys.stockCredit).toBe('99');
    expect(postingKeys.grIrDebit).toBe('86');
    expect(postingKeys.grIrCredit).toBe('96');
    expect(postingKeys.vendorInvoice).toBe('31');
    expect(postingKeys.vendorPayment).toBe('25');
    expect(postingKeys.vendorClearing).toBe('26');
    expect(postingKeys.downPayment).toBe('29');
    expect(postingKeys.downPaymentClearing).toBe('39');
    expect(postingKeys.assetDebit).toBe('70');
    expect(postingKeys.assetCredit).toBe('75');
  });
});

describe('SAP MIGO Inventory Movement Simulation', () => {
  const wbs = 'P-2026-GI01.01';

  test('simulates standard 101 Goods Receipt for PO (general stock vs project stock Q)', () => {
    // 101 General stock
    const grGeneral = simulateMigo({ movement: '101', amount: 5000000n, projectStock: false, wbs: '' });
    expect(grGeneral.ok).toBe(true);
    if (!grGeneral.ok) return;
    expect(grGeneral.value.lines).toEqual([
      { account: '114010', label: 'BSX', side: 'DEBIT', amount: 5000000n, postingKey: '89', obyc: 'BSX', wbs: undefined },
      { account: '210090', label: 'WRX', side: 'CREDIT', amount: 5000000n, postingKey: '96', obyc: 'WRX', wbs: undefined },
    ]);

    // 101 Q Project stock
    const grProject = simulateMigo({ movement: '101', amount: 5000000n, projectStock: true, wbs });
    expect(grProject.ok).toBe(true);
    if (!grProject.ok) return;
    expect(grProject.value.lines[0].account).toBe('114015');
    expect(grProject.value.lines[1].account).toBe('210090');
  });

  test('simulates 103 (GR into blocked stock - no FI) and 105 (Release from blocked stock)', () => {
    // 103 does not form FI journal
    const grBlocked = simulateMigo({ movement: '103', amount: 3000000n, projectStock: false, wbs: '' });
    expect(grBlocked.ok).toBe(true);
    if (!grBlocked.ok) return;
    expect(grBlocked.value.lines.length).toBe(0);
    expect(grBlocked.value.description).toContain('tidak membentuk jurnal FI');

    // 105 posts FI journal
    const releaseBlocked = simulateMigo({ movement: '105', amount: 3000000n, projectStock: false, wbs: '' });
    expect(releaseBlocked.ok).toBe(true);
    if (!releaseBlocked.ok) return;
    expect(releaseBlocked.value.lines.length).toBe(2);
    expect(releaseBlocked.value.lines[0].account).toBe('114010');
    expect(releaseBlocked.value.lines[1].account).toBe('210090');
  });

  test('simulates 122 Return delivery to vendor', () => {
    const returnVendor = simulateMigo({ movement: '122', amount: 1000000n, projectStock: false, wbs: '' });
    expect(returnVendor.ok).toBe(true);
    if (!returnVendor.ok) return;
    expect(returnVendor.value.lines).toEqual([
      { account: '210090', label: 'WRX', side: 'DEBIT', amount: 1000000n, postingKey: '86', obyc: 'WRX', wbs: undefined },
      { account: '114010', label: 'BSX', side: 'CREDIT', amount: 1000000n, postingKey: '99', obyc: 'BSX', wbs: undefined },
    ]);
  });

  test('simulates 201 Goods Issue for Cost Center', () => {
    const giCostCenter = simulateMigo({ movement: '201', amount: 750000n, projectStock: false, wbs: '' });
    expect(giCostCenter.ok).toBe(true);
    if (!giCostCenter.ok) return;
    expect(giCostCenter.value.lines).toEqual([
      { account: '510010', label: 'GBB-VBR', side: 'DEBIT', amount: 750000n, postingKey: '40', obyc: 'GBB-VBR', wbs: undefined },
      { account: '114010', label: 'BSX', side: 'CREDIT', amount: 750000n, postingKey: '99', obyc: 'BSX', wbs: undefined },
    ]);
  });

  test('simulates 221 and 281 Goods Issue to Project/Network (requires WBS KI 235)', () => {
    // Missing WBS rejected
    const missingWbs221 = simulateMigo({ movement: '221', amount: 500000n, projectStock: false, wbs: '' });
    expect(missingWbs221.ok).toBe(false);
    if (!missingWbs221.ok) expect(missingWbs221.error).toContain('KI 235');

    const missingWbs281 = simulateMigo({ movement: '281', amount: 500000n, projectStock: false, wbs: '  ' });
    expect(missingWbs281.ok).toBe(false);
    if (!missingWbs281.ok) expect(missingWbs281.error).toContain('KI 235');

    // 221 from general stock with WBS
    const gi221 = simulateMigo({ movement: '221', amount: 500000n, projectStock: false, wbs });
    expect(gi221.ok).toBe(true);
    if (!gi221.ok) return;
    expect(gi221.value.lines[0]).toEqual({ account: '510010', label: 'GBB-VBR', side: 'DEBIT', amount: 500000n, postingKey: '40', obyc: 'GBB-VBR', wbs });
    expect(gi221.value.lines[1]).toEqual({ account: '114010', label: 'BSX', side: 'CREDIT', amount: 500000n, postingKey: '99', obyc: 'BSX', wbs: undefined });

    // 221 Q from project stock with WBS
    const gi221Q = simulateMigo({ movement: '221', amount: 5000000n, projectStock: true, wbs });
    expect(gi221Q.ok).toBe(true);
    if (!gi221Q.ok) return;
    expect(gi221Q.value.lines[0].wbs).toBe(wbs);
    expect(gi221Q.value.lines[1].account).toBe('114015');

    // 281 for network
    const gi281 = simulateMigo({ movement: '281', amount: 250000n, projectStock: false, wbs });
    expect(gi281.ok).toBe(true);
    if (!gi281.ok) return;
    expect(gi281.value.lines[0].wbs).toBe(wbs);
  });

  test('simulates 261 Goods Issue for Order', () => {
    const giOrder = simulateMigo({ movement: '261', amount: 400000n, projectStock: false, wbs: '' });
    expect(giOrder.ok).toBe(true);
    if (!giOrder.ok) return;
    expect(giOrder.value.lines[0].obyc).toBe('GBB-VBR');
    expect(giOrder.value.lines[1].obyc).toBe('BSX');
  });

  test('simulates 301 (Plant transfer) and 311 (Storage location transfer - no FI)', () => {
    // 301 Plant to plant
    const transfer301 = simulateMigo({ movement: '301', amount: 1500000n, projectStock: false, wbs: '' });
    expect(transfer301.ok).toBe(true);
    if (!transfer301.ok) return;
    expect(transfer301.value.lines[0].account).toBe('114010');
    expect(transfer301.value.lines[1].account).toBe('114010');

    // 311 SLoc to SLoc (no FI)
    const transfer311 = simulateMigo({ movement: '311', amount: 1500000n, projectStock: false, wbs: '' });
    expect(transfer311.ok).toBe(true);
    if (!transfer311.ok) return;
    expect(transfer311.value.lines.length).toBe(0);
    expect(transfer311.value.description).toContain('tidak membentuk jurnal FI');
  });

  test('simulates 412 Transfer to Project Stock Q (requires WBS)', () => {
    const missingWbs412 = simulateMigo({ movement: '412', amount: 1000000n, projectStock: false, wbs: '' });
    expect(missingWbs412.ok).toBe(false);

    const valid412 = simulateMigo({ movement: '412', amount: 1000000n, projectStock: false, wbs });
    expect(valid412.ok).toBe(true);
    if (!valid412.ok) return;
    expect(valid412.value.lines).toEqual([
      { account: '114015', label: 'Stok proyek Q', side: 'DEBIT', amount: 1000000n, postingKey: '89', obyc: 'BSX', wbs },
      { account: '114010', label: 'Stok umum', side: 'CREDIT', amount: 1000000n, postingKey: '99', obyc: 'BSX', wbs: undefined },
    ]);
  });

  test('simulates 551 Scrapping and 561 Initial stock upload', () => {
    // 551 Scrap
    const scrap = simulateMigo({ movement: '551', amount: 200000n, projectStock: false, wbs: '' });
    expect(scrap.ok).toBe(true);
    if (!scrap.ok) return;
    expect(scrap.value.lines[0]).toEqual({ account: '510090', label: 'GBB-VNG', side: 'DEBIT', amount: 200000n, postingKey: '40', obyc: 'GBB-VNG', wbs: undefined });
    expect(scrap.value.lines[1]).toEqual({ account: '114010', label: 'BSX', side: 'CREDIT', amount: 200000n, postingKey: '99', obyc: 'BSX', wbs: undefined });

    // 561 Initial stock
    const initStock = simulateMigo({ movement: '561', amount: 5000000n, projectStock: false, wbs: '' });
    expect(initStock.ok).toBe(true);
    if (!initStock.ok) return;
    expect(initStock.value.lines[0]).toEqual({ account: '114010', label: 'BSX', side: 'DEBIT', amount: 5000000n, postingKey: '89', obyc: 'BSX', wbs: undefined });
    expect(initStock.value.lines[1]).toEqual({ account: '399999', label: 'GBB-BSA', side: 'CREDIT', amount: 5000000n, postingKey: '50', obyc: 'GBB-BSA', wbs: undefined });
  });

  test('simulates 701 Physical inventory gain and 702 Physical inventory loss', () => {
    // 701 Gain
    const gain = simulateMigo({ movement: '701', amount: 150000n, projectStock: false, wbs: '' });
    expect(gain.ok).toBe(true);
    if (!gain.ok) return;
    expect(gain.value.lines[0].obyc).toBe('BSX');
    expect(gain.value.lines[1].obyc).toBe('GBB-INV');

    // 702 Loss
    const loss = simulateMigo({ movement: '702', amount: 150000n, projectStock: false, wbs: '' });
    expect(loss.ok).toBe(true);
    if (!loss.ok) return;
    expect(loss.value.lines[0].obyc).toBe('GBB-INV');
    expect(loss.value.lines[1].obyc).toBe('BSX');
  });

  test('validates inputs: non-positive amounts and unsupported movement types are rejected', () => {
    expect(simulateMigo({ movement: '101', amount: 0n, projectStock: false, wbs: '' }).ok).toBe(false);
    expect(simulateMigo({ movement: '101', amount: -500n, projectStock: false, wbs: '' }).ok).toBe(false);
    expect(simulateMigo({ movement: '999', amount: 1000n, projectStock: false, wbs: '' }).ok).toBe(false);
  });
});

describe('SAP MIRO Invoice Verification Simulation', () => {
  test('Price Control V with 100% full stock coverage absorbs full price variance into BSX', () => {
    // GR = 10,000, Invoice = 11,000 (+1,000 variance, 10% variance triggers Payment Block R)
    const result = simulateMiro({
      grValue: 10000n,
      invoiceValue: 11000n,
      stockCoveragePercent: 100,
      priceControl: 'V',
      fxDifference: 0n,
      taxCode: 'V0',
      withholding: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.lines.find(l => l.obyc === 'BSX')?.amount).toBe(1000n);
    expect(result.value.lines.find(l => l.obyc === 'PRD')).toBeUndefined();
    expect(result.value.description).toContain('Payment Block R');

    // Verify balance
    const sumDebits = result.value.lines.filter(l => l.side === 'DEBIT').reduce((n, l) => n + l.amount, 0n);
    const sumCredits = result.value.lines.filter(l => l.side === 'CREDIT').reduce((n, l) => n + l.amount, 0n);
    expect(sumDebits).toBe(sumCredits);
  });

  test('Price Control V with partial stock coverage (40%) splits variance between BSX and PRD (Modul 03 spec)', () => {
    // Specification Modul 03: GR = 1,000,000, Invoice = 1,100,000 (+100,000 diff).
    // After issue of 60 units, 40 units remain (coverage = 40%).
    // BSX uplift = 40,000; PRD = 60,000.
    const result = simulateMiro({
      grValue: 1000000n,
      invoiceValue: 1100000n,
      stockCoveragePercent: 40,
      priceControl: 'V',
      fxDifference: 0n,
      taxCode: 'V0',
      withholding: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const bsx = result.value.lines.find(l => l.obyc === 'BSX');
    const prd = result.value.lines.find(l => l.obyc === 'PRD');
    expect(bsx?.amount).toBe(40000n);
    expect(prd?.amount).toBe(60000n);

    // Balanced
    const diff = result.value.lines.reduce((n, l) => n + (l.side === 'DEBIT' ? l.amount : -l.amount), 0n);
    expect(diff).toBe(0n);
  });

  test('Price Control V with 0% stock coverage charges entire variance to PRD', () => {
    const result = simulateMiro({
      grValue: 10000n,
      invoiceValue: 11000n,
      stockCoveragePercent: 0,
      priceControl: 'V',
      fxDifference: 0n,
      taxCode: 'V0',
      withholding: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.lines.find(l => l.obyc === 'BSX')).toBeUndefined();
    expect(result.value.lines.find(l => l.obyc === 'PRD')?.amount).toBe(1000n);
  });

  test('Price Control S posts entire variance to PRD regardless of 100% stock coverage', () => {
    const result = simulateMiro({
      grValue: 10000n,
      invoiceValue: 11000n,
      stockCoveragePercent: 100,
      priceControl: 'S',
      fxDifference: 0n,
      taxCode: 'V0',
      withholding: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.lines.find(l => l.obyc === 'BSX')).toBeUndefined();
    expect(result.value.lines.find(l => l.obyc === 'PRD')?.amount).toBe(1000n);
  });

  test('handles negative price variance (credit to stock or PRD) while remaining balanced', () => {
    // GR = 10,000, Invoice = 9,500 (-500 diff, 5% variance -> exactly at threshold, not blocked)
    const resultV = simulateMiro({
      grValue: 10000n,
      invoiceValue: 9500n,
      stockCoveragePercent: 100,
      priceControl: 'V',
      fxDifference: 0n,
      taxCode: 'V0',
      withholding: false,
    });
    expect(resultV.ok).toBe(true);
    if (!resultV.ok) return;

    const bsxLine = resultV.value.lines.find(l => l.obyc === 'BSX');
    expect(bsxLine?.side).toBe('CREDIT');
    expect(bsxLine?.amount).toBe(500n);
    expect(resultV.value.description).toContain('3-way match');

    const diff = resultV.value.lines.reduce((n, l) => n + (l.side === 'DEBIT' ? l.amount : -l.amount), 0n);
    expect(diff).toBe(0n);
  });

  test('posts exchange rate differences strictly to KDM without polluting PRD', () => {
    // USD 1,000 PO: GR rate = 15,000 -> WRX 15m. IR rate = 16,000 -> Vendor 16m, KDM 1m.
    const result = simulateMiro({
      grValue: 15000000n,
      invoiceValue: 15000000n,
      stockCoveragePercent: 0,
      priceControl: 'V',
      fxDifference: 1000000n,
      taxCode: 'V0',
      withholding: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const kdm = result.value.lines.find(l => l.obyc === 'KDM');
    const prd = result.value.lines.find(l => l.obyc === 'PRD');
    expect(kdm?.amount).toBe(1000000n);
    expect(kdm?.account).toBe('710020');
    expect(prd).toBeUndefined();

    // Check balance
    const diff = result.value.lines.reduce((n, l) => n + (l.side === 'DEBIT' ? l.amount : -l.amount), 0n);
    expect(diff).toBe(0n);
  });

  test('applies tax codes (V1 deductible, V2 non-deductible) and withholding tax (PPh 23)', () => {
    // V1 Deductible VAT 11% + PPh 23 (2%)
    // Invoice = 3,500,000 -> VAT = 385,000, PPh 23 = 70,000, Payable = 3,500,000 + 385,000 - 70,000 = 3,815,000
    const resultV1 = simulateMiro({
      grValue: 3500000n,
      invoiceValue: 3500000n,
      stockCoveragePercent: 100,
      priceControl: 'V',
      fxDifference: 0n,
      taxCode: 'V1',
      withholding: true,
    });
    expect(resultV1.ok).toBe(true);
    if (!resultV1.ok) return;

    const vatLine = resultV1.value.lines.find(l => l.account === '115010');
    const whtLine = resultV1.value.lines.find(l => l.account === '213023');
    const vendorLine = resultV1.value.lines.find(l => l.account === '210010');

    expect(vatLine?.amount).toBe(385000n);
    expect(whtLine?.amount).toBe(70000n);
    expect(vendorLine?.amount).toBe(3815000n);

    // V2 Non-deductible VAT: capitalised to BSX / PRD according to stock coverage
    const resultV2 = simulateMiro({
      grValue: 1000000n,
      invoiceValue: 1000000n,
      stockCoveragePercent: 50,
      priceControl: 'V',
      fxDifference: 0n,
      taxCode: 'V2',
      withholding: false,
    });
    expect(resultV2.ok).toBe(true);
    if (!resultV2.ok) return;

    // 11% of 1,000,000 = 110,000. 50% to BSX (55,000), 50% to PRD (55,000)
    const bsxTax = resultV2.value.lines.find(l => l.obyc === 'BSX');
    const prdTax = resultV2.value.lines.find(l => l.obyc === 'PRD');
    expect(bsxTax?.amount).toBe(55000n);
    expect(prdTax?.amount).toBe(55000n);

    // A1 output tax rejected for purchase invoice
    const resultA1 = simulateMiro({
      grValue: 1000000n,
      invoiceValue: 1000000n,
      stockCoveragePercent: 100,
      priceControl: 'V',
      fxDifference: 0n,
      taxCode: 'A1',
      withholding: false,
    });
    expect(resultA1.ok).toBe(false);
  });

  test('evaluates Payment Block R threshold (>5% triggers block, <=5% permits 3-way match)', () => {
    // Exactly 5% (105,000 on 100,000) -> NOT blocked
    const exact5 = simulateMiro({ grValue: 100000n, invoiceValue: 105000n, stockCoveragePercent: 100, priceControl: 'V', fxDifference: 0n, taxCode: 'V0', withholding: false });
    expect(exact5.ok && exact5.value.description).toContain('3-way match');

    // 5.001% (105,001 on 100,000) -> BLOCKED
    const over5 = simulateMiro({ grValue: 10000n, invoiceValue: 10501n, stockCoveragePercent: 100, priceControl: 'V', fxDifference: 0n, taxCode: 'V0', withholding: false });
    expect(over5.ok && over5.value.description).toContain('Payment Block R');
  });

  test('validates inputs for simulateMiro', () => {
    expect(simulateMiro({ grValue: 0n, invoiceValue: 1000n, stockCoveragePercent: 50, priceControl: 'V', fxDifference: 0n, taxCode: 'V0', withholding: false }).ok).toBe(false);
    expect(simulateMiro({ grValue: 1000n, invoiceValue: -10n, stockCoveragePercent: 50, priceControl: 'V', fxDifference: 0n, taxCode: 'V0', withholding: false }).ok).toBe(false);
    expect(simulateMiro({ grValue: 1000n, invoiceValue: 1000n, stockCoveragePercent: 105, priceControl: 'V', fxDifference: 0n, taxCode: 'V0', withholding: false }).ok).toBe(false);
  });
});

describe('SAP PS Availability Control (AVAC) & Commitment Accounting', () => {
  test('calculates AVAC status across boundary conditions (79.99% OK, 80% WARNING, 100% WARNING, >100% ERROR)', () => {
    const budget: Budget = { id: 'WBS-TEST', label: 'Test', released: 100000n, pr: 0n, po: 0n, heldQ: 0n, actual: 0n };

    // 79.999% -> OK
    const okState = calculateAvac({ ...budget, actual: 79999n });
    expect(okState.status).toBe('OK');
    expect(okState.available).toBe(20001n);

    // 80.00% -> WARNING
    const warn80 = calculateAvac({ ...budget, actual: 80000n });
    expect(warn80.status).toBe('WARNING');
    expect(warn80.available).toBe(20000n);

    // 100.00% -> WARNING
    const warn100 = calculateAvac({ ...budget, actual: 100000n });
    expect(warn100.status).toBe('WARNING');
    expect(warn100.available).toBe(0n);

    // 100.001% -> ERROR BP 604
    const errOver = calculateAvac({ ...budget, actual: 100001n });
    expect(errOver.status).toBe('ERROR');
    expect(errOver.available).toBe(-1n);
  });

  test('zero budget returns OK when assigned 0, but ERROR when assigned > 0', () => {
    const zeroBudget: Budget = { id: 'ZERO', label: 'Zero', released: 0n, pr: 0n, po: 0n, heldQ: 0n, actual: 0n };
    expect(calculateAvac(zeroBudget).status).toBe('OK');

    const zeroExceeded = calculateAvac({ ...zeroBudget, pr: 100n });
    expect(zeroExceeded.status).toBe('ERROR');
    expect(zeroExceeded.percent).toBe(Infinity);
  });

  test('guardBudgetChange prevents negative values and overruns', () => {
    const base: Budget = { id: 'WBS-1', label: 'Sipil', released: 50000n, pr: 10000n, po: 0n, heldQ: 0n, actual: 0n };

    // Negative component rejected
    const negative = guardBudgetChange(base, { pr: -15000n });
    expect(negative.ok).toBe(false);
    if (!negative.ok) expect(negative.error).toContain('tidak boleh negatif');

    // Overrun rejected with BP 604
    const overrun = guardBudgetChange(base, { po: 45000n }); // total 55k > 50k
    expect(overrun.ok).toBe(false);
    if (!overrun.ok) expect(overrun.error).toContain('BP 604');
  });

  test('convertCommitment executes complete lifecycle: PR -> PO -> GR_Q -> ISSUE_Q -> DELIVERY_COMPLETED', () => {
    let budget: Budget = { id: 'WBS-FLOW', label: 'Flow', released: 50000n, pr: 0n, po: 0n, heldQ: 0n, actual: 0n };

    // 1. Create PR 30,000
    const prRes = convertCommitment(budget, 'CREATE_PR', 30000n);
    expect(prRes.ok).toBe(true);
    if (!prRes.ok) return;
    budget = prRes.value;
    expect(budget.pr).toBe(30000n);
    expect(calculateAvac(budget).assigned).toBe(30000n);

    // 2. PR to PO 28,000 (negotiated price 28k from 30k PR releases full 30k PR commitment!)
    const poRes = convertCommitment(budget, 'PR_TO_PO', 28000n);
    expect(poRes.ok).toBe(true);
    if (!poRes.ok) return;
    budget = poRes.value;
    expect(budget.pr).toBe(0n);
    expect(budget.po).toBe(28000n);
    expect(calculateAvac(budget).assigned).toBe(28000n); // Available budget increases by 2,000!
    expect(calculateAvac(budget).available).toBe(22000n);

    // 3. Delivery completed on remaining PO commitment (free 2,000 PO)
    const delivRes = convertCommitment(budget, 'DELIVERY_COMPLETED', 2000n);
    expect(delivRes.ok).toBe(true);
    if (!delivRes.ok) return;
    budget = delivRes.value;
    expect(budget.po).toBe(26000n);

    // 4. GR_Q: Goods receipt into project stock Q (COOI po drops, heldQ increases, actual cost remains 0!)
    const grRes = convertCommitment(budget, 'GR_Q', 26000n);
    expect(grRes.ok).toBe(true);
    if (!grRes.ok) return;
    budget = grRes.value;
    expect(budget.po).toBe(0n);
    expect(budget.heldQ).toBe(26000n);
    expect(budget.actual).toBe(0n); // Actual cost in CJI3 is strictly 0!
    expect(calculateAvac(budget).assigned).toBe(26000n);

    // 5. ISSUE_Q: Goods issue 221 Q to project (heldQ drops, actual cost recognized!)
    const giRes = convertCommitment(budget, 'ISSUE_Q', 26000n);
    expect(giRes.ok).toBe(true);
    if (!giRes.ok) return;
    budget = giRes.value;
    expect(budget.heldQ).toBe(0n);
    expect(budget.actual).toBe(26000n);
    expect(calculateAvac(budget).assigned).toBe(26000n);
  });

  test('convertCommitment rejects non-positive amounts', () => {
    const budget: Budget = { id: 'WBS', label: 'T', released: 1000n, pr: 0n, po: 0n, heldQ: 0n, actual: 0n };
    expect(convertCommitment(budget, 'CREATE_PR', 0n).ok).toBe(false);
    expect(convertCommitment(budget, 'CREATE_PR', -100n).ok).toBe(false);
  });
});

describe('SAP Settlement CJ88 & Depreciation AFAB Simulation', () => {
  const wbs = 'P-2026-GI01.01';

  test('settleProject handles periodic settlement to AuC 8000 and full settlement to fixed assets', () => {
    // Periodic settlement to AuC
    const periodic = settleProject(3500000n, 'PERIODIC', '2000', wbs);
    expect(periodic.ok).toBe(true);
    if (!periodic.ok) return;
    expect(periodic.value.lines).toEqual([
      { account: '129010', label: 'AuC', side: 'DEBIT', amount: 3500000n, postingKey: '70' },
      { account: '599010', label: 'Settlement WBS', side: 'CREDIT', amount: 3500000n, postingKey: '50', wbs },
    ]);

    // Full settlement to Building (class 2000)
    const fullBuilding = settleProject(3500000n, 'FULL', '2000', wbs);
    expect(fullBuilding.ok).toBe(true);
    if (!fullBuilding.ok) return;
    expect(fullBuilding.value.lines).toEqual([
      { account: '121020', label: 'Aset tetap', side: 'DEBIT', amount: 3500000n, postingKey: '70' },
      { account: '129010', label: 'AuC', side: 'CREDIT', amount: 3500000n, postingKey: '75', wbs },
    ]);

    // Full settlement to Machinery/Trafo (class 3000)
    const fullTrafo = settleProject(5500000n, 'FULL', '3000', wbs);
    expect(fullTrafo.ok).toBe(true);
    if (!fullTrafo.ok) return;
    expect(fullTrafo.value.lines[0].account).toBe('121030');
    expect(fullTrafo.value.lines[1].account).toBe('129010');

    // Missing WBS rejected
    expect(settleProject(1000n, 'PERIODIC', '2000', '').ok).toBe(false);
    // Non-positive amount rejected
    expect(settleProject(0n, 'PERIODIC', '2000', wbs).ok).toBe(false);
  });

  test('calculateDepreciation excludes AuC 8000 and calculates exact straight-line values', () => {
    // AuC only -> no depreciation
    const aucOnly = calculateDepreciation([{ id: '8000015-0', assetClass: '8000', value: 9000000n, depreciation: 0n, months: 0 }]);
    expect(aucOnly.ok).toBe(true);
    if (!aucOnly.ok) return;
    expect(aucOnly.value.lines.length).toBe(0);
    expect(aucOnly.value.description).toContain('AuC tidak disusutkan');

    // Building $35,000 / 240 months = $145.83 (14583)
    // Trafo $55,000 / 120 months = $458.33 (45833)
    // Total monthly = $604.16 (60416)
    const run = calculateDepreciation([
      { id: '8000015-0', assetClass: '8000', value: 0n, depreciation: 0n, months: 0 },
      { id: '2000099-0', assetClass: '2000', value: 3500000n, depreciation: 0n, months: 240 },
      { id: '3000099-0', assetClass: '3000', value: 5500000n, depreciation: 0n, months: 120 },
    ]);
    expect(run.ok).toBe(true);
    if (!run.ok) return;

    expect(run.value.lines).toEqual([
      { account: '610010', label: 'Beban penyusutan', side: 'DEBIT', amount: 60416n, postingKey: '40' },
      { account: '122020', label: 'Akumulasi 2000099-0', side: 'CREDIT', amount: 14583n, postingKey: '75' },
      { account: '122030', label: 'Akumulasi 3000099-0', side: 'CREDIT', amount: 45833n, postingKey: '75' },
    ]);

    // Check balance
    const diff = run.value.lines.reduce((n, l) => n + (l.side === 'DEBIT' ? l.amount : -l.amount), 0n);
    expect(diff).toBe(0n);
  });

  test('calculateDepreciation respects NBV floor when remaining value is less than monthly rate', () => {
    const nearEnd = calculateDepreciation([
      { id: '2000099-0', assetClass: '2000', value: 10000n, depreciation: 9900n, months: 10 },
    ]);
    expect(nearEnd.ok).toBe(true);
    if (!nearEnd.ok) return;
    // Monthly would be 1000n, but remaining is only 100n
    expect(nearEnd.value.lines[0].amount).toBe(100n);
    expect(nearEnd.value.lines[1].amount).toBe(100n);
  });

  test('calculateDepreciation validates asset properties', () => {
    // Non-positive months
    expect(calculateDepreciation([{ id: '1', assetClass: '2000', value: 1000n, depreciation: 0n, months: 0 }]).ok).toBe(false);
    // Depreciation exceeds value
    expect(calculateDepreciation([{ id: '1', assetClass: '2000', value: 1000n, depreciation: 1500n, months: 12 }]).ok).toBe(false);
  });
});

describe('10-Step End-to-End CAPEX $100,000 Case Study Simulation', () => {
  test('executes all 17 sub-actions in sequence and validates accounting checkpoints', () => {
    let state = initialSapState();

    // Verify initial state
    expect(state.caseAction).toBe(0);
    expect(state.stockGeneral).toBe(500000n);
    expect(state.stockQ).toBe(0n);
    expect(state.journals.length).toBe(0);

    for (let i = 0; i < caseActions.length; i++) {
      const action = caseActions[i];
      const result = executeCaseAction(state);
      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error(`Action failed: ${action.id}`);
      state = result.value;

      // Checkpoint Step 1: Structure creation
      if (action.id === 'project') {
        expect(state.tables.PRPS.length).toBe(2);
      }
      // Checkpoint Step 2: Budget release ($40k sipil, $60k trafo)
      if (action.id === 'budget') {
        expect(state.budgets[0].released).toBe(4000000n);
        expect(state.budgets[1].released).toBe(6000000n);
      }
      // Checkpoint Step 3: Project release
      if (action.id === 'release') {
        expect(state.caseStatus).toBe('REL BUDG AVAC AUC');
        expect(state.assets.length).toBe(2); // AuC assets
      }
      // Checkpoint Step 6A: MIGO 101 Q (GR trafo $50k)
      if (action.id === 'gr-q') {
        expect(state.stockQ).toBe(5000000n);
        expect(state.budgets[1].po).toBe(0n);
        expect(state.budgets[1].heldQ).toBe(5000000n);
        expect(state.budgets[1].actual).toBe(0n); // Actual remains 0 until GI!
      }
      // Checkpoint Step 6B: MIGO 221 Q (GI trafo $50k)
      if (action.id === 'gi-q') {
        expect(state.stockQ).toBe(0n);
        expect(state.budgets[1].heldQ).toBe(0n);
        expect(state.budgets[1].actual).toBe(5000000n); // Cost recognized
      }
      // Checkpoint Step 6C: MIGO 221 Cable ($5k)
      if (action.id === 'gi-cable') {
        expect(state.stockGeneral).toBe(0n);
        expect(state.budgets[1].actual).toBe(5500000n);
      }
      // Checkpoint Step 7: ML81N SES ($35k)
      if (action.id === 'ses') {
        expect(state.budgets[0].po).toBe(0n);
        expect(state.budgets[0].actual).toBe(3500000n);
      }
      // Checkpoint Step 9: CJ88 Periodic settlement ($90k AuC)
      if (action.id === 'periodic') {
        expect(state.assets[0].value).toBe(3500000n);
        expect(state.assets[1].value).toBe(5500000n);
      }
      // Checkpoint Step 10: CJ88 Full settlement (TECO, AuC cleared, final assets created)
      if (action.id === 'full') {
        expect(state.caseStatus).toBe('TECO');
        expect(state.assets[0].value).toBe(0n); // AuC cleared
        expect(state.assets[1].value).toBe(0n);
        expect(state.assets[2].value).toBe(3500000n); // Building
        expect(state.assets[3].value).toBe(5500000n); // Trafo
      }
      // Checkpoint Step 10: AFAB Depreciation
      if (action.id === 'depreciate') {
        expect(state.assets[2].depreciation).toBe(14583n);
        expect(state.assets[3].depreciation).toBe(45833n);
      }
    }

    // Attempting further execution after completion is rejected
    expect(executeCaseAction(state).ok).toBe(false);

    // Final checks
    expect(state.budgets[0].actual).toBe(3500000n);
    expect(state.budgets[1].actual).toBe(5500000n);
    expect(calculateAvac(state.budgets[0]).available).toBe(500000n);
    expect(calculateAvac(state.budgets[1]).available).toBe(500000n);

    // Total AVAC available across project is $10,000
    expect(state.budgets.reduce((n, b) => n + calculateAvac(b).available, 0n)).toBe(1000000n);

    // All journal documents are perfectly balanced (Debits === Credits)
    for (const journal of state.journals) {
      const balance = journal.lines.reduce((n, line) => n + (line.side === 'DEBIT' ? line.amount : -line.amount), 0n);
      expect(balance).toBe(0n);
    }
  });
});

describe('SAP Database Table Projections (S/4HANA vs ECC 6.0)', () => {
  let finishedState: SapState;

  test('runs case to prepare finished state for projection', () => {
    let state = initialSapState();
    for (let i = 0; i < caseActions.length; i++) {
      const res = executeCaseAction(state);
      expect(res.ok).toBe(true);
      if (res.ok) state = res.value;
    }
    finishedState = state;
  });

  test('projects S/4HANA tables: Universal Journal (ACDOCA) and MATDOC', () => {
    const s4Tables = projectSapTables(finishedState, 'S4');

    // ACDOCA exists and contains signed amounts
    expect(s4Tables.ACDOCA).toBeDefined();
    expect(s4Tables.ACDOCA.length).toBeGreaterThan(20);
    const firstAcdoca = s4Tables.ACDOCA[0];
    expect(firstAcdoca.BELNR).toBeDefined();
    expect(firstAcdoca.DOCLN).toBe('000001');
    expect(firstAcdoca.RACCT).toBeDefined();
    expect(firstAcdoca.HSL).toBeDefined();

    // MATDOC exists in S/4HANA
    expect(s4Tables.MATDOC).toBeDefined();
    expect(s4Tables.MATDOC.length).toBeGreaterThan(0);

    // ECC tables must NOT be present in S/4HANA projection
    expect(s4Tables.MKPF).toBeUndefined();
    expect(s4Tables.MSEG).toBeUndefined();

    // Common tables
    expect(s4Tables.BKPF).toBeDefined();
    expect(s4Tables.BSEG).toBeDefined();
    expect(s4Tables.PRPS).toBeDefined();
    expect(s4Tables.BPGE).toBeDefined();
    expect(s4Tables.ANLA).toBeDefined();
    expect(s4Tables.ANLC).toBeDefined();
  });

  test('projects ECC 6.0 tables: MKPF and MSEG without ACDOCA or MATDOC', () => {
    const eccTables = projectSapTables(finishedState, 'ECC');

    // MKPF and MSEG exist in ECC
    expect(eccTables.MKPF).toBeDefined();
    expect(eccTables.MSEG).toBeDefined();

    // ACDOCA and MATDOC must NOT be present in ECC projection
    expect(eccTables.ACDOCA).toBeUndefined();
    expect(eccTables.MATDOC).toBeUndefined();

    // BSEG line items have SHKZG ('S' / 'H') and BSCHL
    expect(eccTables.BSEG.length).toBeGreaterThan(20);
    const bsegLine = eccTables.BSEG[0];
    expect(['S', 'H']).toContain(bsegLine.SHKZG);
    expect(bsegLine.BSCHL).toBeDefined();
    expect(bsegLine.DMBTR.startsWith('$')).toBe(true);
  });
});

describe('SAP Monetary Arithmetic & Parsing Helpers', () => {
  test('parseMoney parses valid non-negative numbers with up to two decimals', () => {
    expect(parseMoney('100')).toEqual({ ok: true, value: 10000n });
    expect(parseMoney('100.5')).toEqual({ ok: true, value: 10050n });
    expect(parseMoney('100.50')).toEqual({ ok: true, value: 10050n });
    expect(parseMoney('0.05')).toEqual({ ok: true, value: 5n });
    expect(parseMoney('  25.75  ')).toEqual({ ok: true, value: 2575n });
  });

  test('parseMoney rejects negative values, three decimal places, and non-numeric inputs', () => {
    expect(parseMoney('-50').ok).toBe(false);
    expect(parseMoney('10.555').ok).toBe(false);
    expect(parseMoney('abc').ok).toBe(false);
    expect(parseMoney('10,00').ok).toBe(false);
  });

  test('roundRatio performs standard half-up rounding for positive and negative numerators', () => {
    expect(roundRatio(10n, 3n)).toBe(3n);
    expect(roundRatio(11n, 3n)).toBe(4n);
    expect(roundRatio(5n, 2n)).toBe(3n);
    expect(roundRatio(-10n, 3n)).toBe(-3n);
    expect(roundRatio(-11n, 3n)).toBe(-4n);
    expect(() => roundRatio(10n, 0n)).toThrow(RangeError);
    expect(() => roundRatio(10n, -1n)).toThrow(RangeError);
  });

  test('formatMoney formats currency strings accurately', () => {
    expect(formatMoney(10000n)).toBe('$100.00');
    expect(formatMoney(5000000n)).toBe('$50,000.00');
    expect(formatMoney(-5000000n)).toBe('-$50,000.00');
    expect(formatMoney(0n)).toBe('$0.00');
    expect(formatMoney(5n)).toBe('$0.05');
  });
});

describe('SAP Engine Determinism & State Immutability', () => {
  test('executeCaseAction does not mutate the input state object', () => {
    const original = initialSapState();
    const deepClone = JSON.parse(JSON.stringify(original, (_, v) => typeof v === 'bigint' ? v.toString() : v));

    const result = executeCaseAction(original);
    expect(result.ok).toBe(true);

    const afterJson = JSON.parse(JSON.stringify(original, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    expect(deepClone).toEqual(afterJson);
  });

  test('consecutive identical runs produce identical states and projections', () => {
    let state1 = initialSapState();
    let state2 = initialSapState();

    for (let i = 0; i < 5; i++) {
      const r1 = executeCaseAction(state1);
      const r2 = executeCaseAction(state2);
      expect(r1.ok && r2.ok).toBe(true);
      if (r1.ok && r2.ok) {
        state1 = r1.value;
        state2 = r2.value;
      }
    }

    expect(state1).toEqual(state2);
    expect(projectSapTables(state1, 'S4')).toEqual(projectSapTables(state2, 'S4'));
  });
});
