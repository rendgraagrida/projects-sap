import { useState } from 'react';
import { checkCredit, postCustomerInvoice, postIncomingPayment, runDunning } from '../lib/fi-ar-engine';
import { formatMoney, parseMoney } from '../lib/sap-money';
import { useSapStore } from '../store/use-sap-store';
import type { ArSettlementMode } from '../types/sap';

const today = '2026-11-30';

export function FiArLab() {
  const store = useSapStore();
  const state = store.fiArState;
  const [customer, setCustomer] = useState('CUST-TELCO-01');
  const [net, setNet] = useState('5000');
  const [taxRate, setTaxRate] = useState('11');
  const [invoiceDate, setInvoiceDate] = useState('2026-11-01');
  const [dueDays, setDueDays] = useState('30');
  const [cash, setCash] = useState('5550');
  const [withholding, setWithholding] = useState('0');
  const [mode, setMode] = useState<ArSettlementMode>('full');
  const [runDate, setRunDate] = useState(today);
  const [dunningLevel, setDunningLevel] = useState('1');
  const [creditLimit, setCreditLimit] = useState('10000');
  const [salesExposure, setSalesExposure] = useState('0');
  const [feedback, setFeedback] = useState({ text: '', error: false });

  const report = (result: { ok: boolean; value?: unknown; error?: string }) => {
    setFeedback({ text: result.ok ? 'Perubahan FI-AR berhasil diterapkan pada data sintetis.' : result.error ?? 'Operasi FI-AR gagal.', error: !result.ok });
  };

  return <>
    <div className="eyebrow">FINANCIAL ACCOUNTING · ACCOUNTS RECEIVABLE</div>
    <h1>FI-AR Lab · Piutang Pelanggan</h1>
    <p>Lab sintetis untuk memahami customer invoice, incoming payment, clearing, withholding, dunning, credit check, dan open item. Tidak terhubung ke SAP atau bank riil.</p>
    {feedback.text && <div role={feedback.error ? 'alert' : 'status'} className={`notice ${feedback.error ? 'error' : ''}`}>{feedback.text}</div>}

    <section className="fiar-summary-grid" aria-label="Ringkasan FI-AR">
      <div className="sales-metric-card"><span>Open Item</span><b>{formatMoney(state.openItems.reduce((sum, item) => sum + item.remaining, 0n))}</b></div>
      <div className="sales-metric-card"><span>Cleared Item</span><b>{state.clearedItems.length}</b></div>
      <div className="sales-metric-card"><span>Dunning</span><b>{state.dunningEligible ? `Level ${state.dunningLevel}` : 'Tidak eligible'}</b></div>
      <div className={`sales-metric-card fiar-status-${state.creditStatus.toLowerCase()}`}><span>Credit Check</span><b>{state.creditStatus}</b></div>
    </section>

    <section className="fiar-lab-section">
      <h2>1. FB70 · Customer Invoice</h2>
      <p>Posting invoice non-SD secara langsung ke customer. Untuk invoice dari SD, gunakan billing document `VF01` dan account determination `VKOA`.</p>
      <form onSubmit={event => {
        event.preventDefault();
        const value = parseMoney(net);
        const result = value.ok ? postCustomerInvoice(state, { customer, net: value.value, taxRate: Number(taxRate), invoiceDate, dueDays: Number(dueDays) }) : value;
        if (result.ok) store.setFiArState(result.value);
        report(result);
      }}>
        <div className="form-grid">
          <label>Customer<input value={customer} onChange={event => setCustomer(event.target.value)} /></label>
          <label>Nilai net USD<input inputMode="decimal" value={net} onChange={event => setNet(event.target.value)} /></label>
          <label>PPN fixture (%)<input inputMode="decimal" value={taxRate} onChange={event => setTaxRate(event.target.value)} /></label>
          <label>Tanggal invoice<input type="date" value={invoiceDate} onChange={event => setInvoiceDate(event.target.value)} /></label>
          <label>Jatuh tempo (hari)<input inputMode="numeric" value={dueDays} onChange={event => setDueDays(event.target.value)} /></label>
        </div>
        <button type="submit" className="primary" disabled={Boolean(state.invoice)}>Post customer invoice</button>
      </form>
    </section>

    <section className="fiar-lab-section">
      <h2>2. F-28 · Incoming Payment & Clearing</h2>
      <p><b>Partial</b> mempertahankan invoice asli sebagai open item. <b>Residual</b> men-clearing invoice asli lalu membuat residual item baru. <b>Full</b> menutup saldo penuh.</p>
      <form onSubmit={event => {
        event.preventDefault();
        const cashValue = parseMoney(cash);
        const withholdingValue = parseMoney(withholding);
        const result = cashValue.ok && withholdingValue.ok ? postIncomingPayment(state, { mode, cash: cashValue.value, withholding: withholdingValue.value }) : { ok: false as const, error: 'Nominal kas atau withholding tidak valid.' };
        if (result.ok) store.setFiArState(result.value);
        report(result);
      }}>
        <div className="form-grid">
          <label>Mode clearing<select value={mode} onChange={event => setMode(event.target.value as ArSettlementMode)}><option value="partial">Partial payment</option><option value="residual">Residual item</option><option value="full">Full clearing</option></select></label>
          <label>Kas masuk USD<input inputMode="decimal" value={cash} onChange={event => setCash(event.target.value)} /></label>
          <label>Withholding / bukti potong USD<input inputMode="decimal" value={withholding} onChange={event => setWithholding(event.target.value)} /></label>
        </div>
        <button type="submit" className="primary" disabled={!state.openItems.length}>Post incoming payment</button>
      </form>
      {state.lastPayment && <div className="detail-chip">Terakhir: {state.lastPayment.mode} · diterapkan {formatMoney(state.lastPayment.applied)} · residual {formatMoney(state.lastPayment.residual)}</div>}
    </section>

    <section className="fiar-lab-section">
      <h2>3. Dunning & Credit Management</h2>
      <p>Dunning hanya menandai open item yang sudah melewati due date. Credit check membandingkan open receivable + sales exposure terhadap credit limit.</p>
      <div className="form-grid">
        <form onSubmit={event => { event.preventDefault(); const result = runDunning(state, runDate, Number(dunningLevel)); if (result.ok) store.setFiArState(result.value); report(result); }}>
          <label>Tanggal dunning run<input type="date" value={runDate} onChange={event => setRunDate(event.target.value)} /></label>
          <label>Dunning level<select value={dunningLevel} onChange={event => setDunningLevel(event.target.value)}><option value="1">Level 1 · Reminder</option><option value="2">Level 2 · Warning</option><option value="3">Level 3 · Final notice</option><option value="4">Level 4 · Legal escalation</option></select></label>
          <button type="submit">Evaluate dunning</button>
        </form>
        <form onSubmit={event => { event.preventDefault(); const limit = parseMoney(creditLimit); const exposure = parseMoney(salesExposure); const result = limit.ok && exposure.ok ? checkCredit(state, limit.value, exposure.value) : { ok: false as const, error: 'Credit limit atau sales exposure tidak valid.' }; if (result.ok) store.setFiArState(result.value); report(result); }}>
          <label>Credit limit USD<input inputMode="decimal" value={creditLimit} onChange={event => setCreditLimit(event.target.value)} /></label>
          <label>Sales order exposure USD<input inputMode="decimal" value={salesExposure} onChange={event => setSalesExposure(event.target.value)} /></label>
          <button type="submit">Run credit check</button>
        </form>
      </div>
    </section>

    <section className="fiar-lab-section">
      <h2>Open & Cleared Items · BSID / BSAD</h2>
      <div className="table-wrap"><table><caption className="sr-only">Open and cleared customer items</caption><thead><tr><th>Status</th><th>Dokumen</th><th>Customer</th><th>Saldo</th><th>Due date</th></tr></thead><tbody>{[...state.openItems, ...state.clearedItems].map(item => <tr key={`${item.id}-${item.status}`}><td>{item.status}</td><td>{item.id} · {item.documentType}</td><td>{item.customer}</td><td>{formatMoney(item.remaining)}</td><td>{item.dueDate}</td></tr>)}</tbody></table></div>
    </section>

    <button type="button" onClick={() => { store.resetFiAr(); setFeedback({ text: 'Lab FI-AR direset.', error: false }); }}>Reset FI-AR Lab</button>
  </>;
}
