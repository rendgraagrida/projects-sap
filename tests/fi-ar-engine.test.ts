import { describe, expect, test } from 'bun:test';
import { checkCredit, initialFiArState, isJournalBalanced, postCustomerInvoice, postIncomingPayment, projectFiArTables, runDunning } from '../src/lib/fi-ar-engine';

const invoiceInput = { customer: 'CUST-TELCO-01', net: 500000n, taxRate: 11, invoiceDate: '2026-11-01', dueDays: 30 };

function posted() {
  const result = postCustomerInvoice(initialFiArState(), invoiceInput);
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

describe('FI-AR invoice and clearing lifecycle', () => {
  test('FB70 creates a balanced customer invoice and open item', () => {
    const state = posted();
    expect(state.invoice?.gross).toBe(555000n);
    expect(state.openItems[0]?.remaining).toBe(555000n);
    expect(state.journals[0]?.tcode).toBe('FB70');
    expect(isJournalBalanced(state.journals[0]!)).toBe(true);
  });

  test('partial payment leaves the original invoice open', () => {
    const result = postIncomingPayment(posted(), { mode: 'partial', cash: 200000n, withholding: 0n });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.openItems[0]?.id).toBe('18000001');
    expect(result.value.openItems[0]?.remaining).toBe(355000n);
    expect(result.value.clearedItems).toHaveLength(0);
  });

  test('residual item clears original invoice and creates a new open item', () => {
    const result = postIncomingPayment(posted(), { mode: 'residual', cash: 200000n, withholding: 0n });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.openItems[0]?.id).toBe('18000001-R1');
    expect(result.value.openItems[0]?.remaining).toBe(355000n);
    expect(result.value.clearedItems[0]?.remaining).toBe(0n);
  });

  test('full clearing can combine cash and withholding and closes BSID', () => {
    const result = postIncomingPayment(posted(), { mode: 'full', cash: 545000n, withholding: 10000n });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.openItems).toEqual([]);
    expect(result.value.clearedItems[0]?.status).toBe('CLEARED');
    expect(result.value.journals[1]?.tcode).toBe('F-28');
    expect(isJournalBalanced(result.value.journals[1]!)).toBe(true);
    expect(projectFiArTables(result.value).BSID).toEqual([]);
    expect(projectFiArTables(result.value).BSAD).toHaveLength(1);
  });
});

describe('FI-AR controls', () => {
  test('dunning only becomes eligible after due date', () => {
    const beforeDue = runDunning(posted(), '2026-11-15', 1);
    expect(beforeDue.ok).toBe(true);
    if (!beforeDue.ok) return;
    expect(beforeDue.value.dunningEligible).toBe(false);
    const afterDue = runDunning(posted(), '2026-12-05', 2);
    expect(afterDue.ok).toBe(true);
    if (!afterDue.ok) return;
    expect(afterDue.value.dunningEligible).toBe(true);
    expect(afterDue.value.dunningLevel).toBe(2);
  });

  test('credit check includes open receivable and sales exposure', () => {
    const approved = checkCredit(posted(), 1000000n, 300000n);
    expect(approved.ok).toBe(true);
    if (!approved.ok) return;
    expect(approved.value.creditExposure).toBe(855000n);
    expect(approved.value.creditStatus).toBe('APPROVED');
    const blocked = checkCredit(posted(), 800000n, 300000n);
    expect(blocked.ok).toBe(true);
    if (!blocked.ok) return;
    expect(blocked.value.creditStatus).toBe('BLOCKED');
  });
});
