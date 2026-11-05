import { useState } from 'react';
import { calculateAvac } from '../lib/sap-engine';
import { convertCommitment, type CommitmentOperation } from '../lib/project-engine';
import { formatMoney, parseMoney } from '../lib/sap-money';
import { useSapStore } from '../store/use-sap-store';
import type { Budget } from '../types/sap';

const initial: Budget = { id: 'SANDBOX-WBS', label: 'Sandbox AVAC', released: 10000000n, pr: 0n, po: 0n, heldQ: 0n, actual: 0n };
const operations: { code: CommitmentOperation; label: string }[] = [
  { code: 'CREATE_PR', label: 'Buat PR' }, { code: 'PR_TO_PO', label: 'Konversi PR → PO' },
  { code: 'CREATE_PO', label: 'Buat PO' }, { code: 'GR_DIRECT', label: 'GR/SES langsung → actual' },
  { code: 'GR_Q', label: '101 Q → alokasi Q lab' }, { code: 'ISSUE_Q', label: '221 Q → actual' },
  { code: 'DELIVERY_COMPLETED', label: 'Kurangi sisa komitmen pengiriman (lab)' },
];

export function AvacSandbox() {
  const { avacBudget: budget, setAvacBudget } = useSapStore();
  const [amount, setAmount] = useState('10000');
  const [prRelease, setPrRelease] = useState('10000');
  const [released, setReleased] = useState(() => formatMoney(budget.released).replace(/[$,]/g, ''));
  const [operation, setOperation] = useState<CommitmentOperation>('CREATE_PR');
  const [error, setError] = useState('');
  const status = calculateAvac(budget);
  return <>
    <div className="eyebrow">PROJECT SYSTEM · SANDBOX AVAC</div><h1>Availability Control</h1>
    <p>Assigned lab = PR + open PO + reservasi nilai stok Q + actual. Konversi memindahkan nilai tanpa menghitung dua kali. Warning 80% dan penolakan di atas 100% adalah kebijakan contoh; SAP memakai budget profile, release, tolerance dan pengecualian yang dikonfigurasi. Reservasi Q ini bukan komitmen procurement COOI.</p>
    <form onSubmit={event => {
      event.preventDefault();
      const result = parseMoney(released);
      if (!result.ok) { setError(result.error); return; }
      const next = { ...budget, released: result.value };
      if (calculateAvac(next).status === 'ERROR') { setError('Budget baru lebih kecil dari assigned; perubahan ditolak.'); return; }
      setAvacBudget(next);
      setError('');
    }}>
      <div className="form-grid"><label>Released budget USD<input inputMode="decimal" value={released} onChange={event => setReleased(event.target.value)} /></label><div className="field-action"><button type="submit">Tetapkan budget</button></div></div>
    </form>
    <form onSubmit={event => {
      event.preventDefault();
      const value = parseMoney(amount);
      if (!value.ok) { setError(value.error); return; }
      const releasedPr = operation === 'PR_TO_PO' ? parseMoney(prRelease) : null;
      if (releasedPr && !releasedPr.ok) { setError(releasedPr.error); return; }
      const result = convertCommitment(budget, operation, value.value, releasedPr?.ok ? releasedPr.value : undefined);
      if (!result.ok) { setError(result.error); return; }
      setAvacBudget(result.value);
      setError('');
    }}>
      <div className="form-grid">
        <label>Transaksi AVAC<select value={operation} onChange={event => setOperation(event.target.value as CommitmentOperation)}>{operations.map(item => <option value={item.code} key={item.code}>{item.label}</option>)}</select></label>
        <label>{operation === 'PR_TO_PO' ? 'Nilai PO baru USD' : 'Nilai transaksi USD'}<input inputMode="decimal" value={amount} onChange={event => setAmount(event.target.value)} /></label>
        {operation === 'PR_TO_PO' && <label>Nilai PR yang dilepas USD<input inputMode="decimal" value={prRelease} onChange={event => setPrRelease(event.target.value)} /></label>}
      </div>
      <div className="actions"><button type="submit" className="primary">Terapkan transaksi</button><button type="button" onClick={() => { setAvacBudget({ ...initial }); setReleased('100000'); setAmount('10000'); setPrRelease('10000'); setOperation('CREATE_PR'); setError(''); }}>Reset sandbox AVAC</button></div>
    </form>
    <div className="mapping">{Object.entries({ 'PR commitment': budget.pr, 'Open PO commitment': budget.po, 'Reservasi Q (lab)': budget.heldQ, 'Actual cost': budget.actual, Assigned: status.assigned, Available: status.available }).map(([name, value]) => <div key={name}><b>{name}</b><span>{formatMoney(value)}</span></div>)}</div>
    <div role={error ? 'alert' : 'status'} className={`notice ${error ? 'error' : ''}`}>{error || `${status.status} · ${Number.isFinite(status.percent) ? status.percent : '∞'}% budget digunakan`}</div>
    <small>Model nilai agregat, bukan kuantitas atau dokumen SAP. Delivery Completed tidak melarang penerimaan tambahan pada sistem nyata. MIRO tanpa selisih tidak membuat biaya kedua kali di model ini.</small>
  </>;
}
