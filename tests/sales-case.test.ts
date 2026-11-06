import { describe, expect, test } from 'bun:test';
import { executeSalesCaseAction, initialSalesState, salesCaseActions } from '../src/data/sales-case';
import { salesStepDetails } from '../src/data/sales-step-details';

describe('SAP SD Telco Internet Sales Case Simulation', () => {
  test('initial state begins with 0 actions and zero balances', () => {
    const s = initialSalesState();
    expect(s.salesAction).toBe(0);
    expect(s.status).toBe('CRTD');
    expect(s.contractValue).toBe(0n);
    expect(s.receivables).toBe(0n);
    expect(s.revenueMrc).toBe(0n);
    expect(s.revenueOtc).toBe(0n);
    expect(s.taxOutput).toBe(0n);
    expect(s.cashCollected).toBe(0n);
    expect(s.journals).toHaveLength(0);
  });

  test('has exactly 6 sequential sales actions with inspector details', () => {
    expect(salesCaseActions).toHaveLength(6);
    expect(salesCaseActions.map(a => a.step)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const action of salesCaseActions) {
      expect(salesStepDetails[action.id]).toBeDefined();
      expect(salesStepDetails[action.id].businessPurpose.length).toBeGreaterThan(30);
      expect(salesStepDetails[action.id].inputData.length).toBeGreaterThanOrEqual(3);
    }
  });

  test('executes end-to-end sales lifecycle and balances all journals', () => {
    let state = initialSalesState();

    // Step 1: Quote (VA21)
    let res = executeSalesCaseAction(state);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    state = res.value;
    expect(state.status).toBe('QUOT');
    expect(state.contractValue).toBe(650000n);
    expect(state.tables.VBAK?.[0]?.AUART).toBe('QT');

    // Step 2: Sales Order (VA01)
    res = executeSalesCaseAction(state);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    state = res.value;
    expect(state.status).toBe('SO CRTD');
    expect(state.tables.VBAP).toHaveLength(2);
    expect(state.tables.FPLA).toBeDefined();
    expect(state.tables.FPLT).toHaveLength(2);

    // Step 3: Outbound Delivery (VL01N)
    res = executeSalesCaseAction(state);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    state = res.value;
    expect(state.status).toBe('ACTV');
    expect(state.tables.LIKP).toBeDefined();

    // Step 4: OTC Invoice (VF01)
    res = executeSalesCaseAction(state);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    state = res.value;
    expect(state.status).toBe('INV OTC');
    expect(state.revenueOtc).toBe(150000n); // $1,500.00
    expect(state.receivables).toBe(166500n); // $1,665.00

    // Step 5: MRC Invoice (VF01 / VF04)
    res = executeSalesCaseAction(state);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    state = res.value;
    expect(state.status).toBe('INV MRC');
    expect(state.revenueMrc).toBe(500000n); // $5,000.00
    expect(state.receivables).toBe(721500n); // $1,665 + $5,550 = $7,215.00

    // Step 6: Payment (F-28)
    res = executeSalesCaseAction(state);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    state = res.value;
    expect(state.status).toBe('PAID CLSD');
    expect(state.receivables).toBe(0n); // Cleared!
    expect(state.cashCollected).toBe(721500n); // Full collection $7,215.00

    // Verify all journals are balanced (Debit === Credit)
    expect(state.journals.length).toBeGreaterThanOrEqual(4);
    for (const j of state.journals) {
      const debit = j.lines.filter(l => l.side === 'DEBIT').reduce((sum, l) => sum + l.amount, 0n);
      const credit = j.lines.filter(l => l.side === 'CREDIT').reduce((sum, l) => sum + l.amount, 0n);
      expect(debit).toBe(credit);
    }
  });

  test('rejects execution when already at end of actions', () => {
    let state = initialSalesState();
    state.salesAction = salesCaseActions.length;
    const res = executeSalesCaseAction(state);
    expect(res.ok).toBe(false);
  });
});
