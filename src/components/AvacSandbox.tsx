import { useState } from 'react';
import { calculateAvac } from '../lib/sap-engine';
import { convertCommitment, type CommitmentOperation } from '../lib/project-engine';
import { formatMoney, parseMoney } from '../lib/sap-money';
import type { Budget } from '../types/sap';

const initial: Budget = { id: 'SANDBOX-WBS', label: 'Sandbox', released: 10000000n, pr: 0n, po: 0n, heldQ: 0n, actual: 0n };
const operations: { code: CommitmentOperation; label: string }[] = [
  { code: 'CREATE_PR', label: 'Buat PR' }, { code: 'PR_TO_PO', label: 'Konversi PR → PO' }, { code: 'CREATE_PO', label: 'Buat PO' }, { code: 'GR_DIRECT', label: 'GR/SES langsung → actual' }, { code: 'GR_Q', label: '101 Q → held Q' }, { code: 'ISSUE_Q', label: '221 Q → actual' }, { code: 'DELIVERY_COMPLETED', label: 'Delivery Completed (ELIKZ)' },
];
export function AvacSandbox() {
  const [budget, setBudget] = useState(initial); const [amount, setAmount] = useState('10000'); const [released, setReleased] = useState('100000'); const [operation, setOperation] = useState<CommitmentOperation>('CREATE_PR'); const [error, setError] = useState('');
  const updateRelease = () => { const result = parseMoney(released); if (!result.ok) { setError(result.error); return; } const next = { ...budget, released: result.value }; if (calculateAvac(next).status === 'ERROR') { setError('BP 604: budget baru lebih kecil dari assigned.'); return; } setBudget(next); setError(''); };
  const execute = () => { const value = parseMoney(amount); if (!value.ok) { setError(value.error); return; } const result = convertCommitment(budget, operation, value.value); if (!result.ok) { setError(result.error); return; } setBudget(result.value); setError(''); };
  const status = calculateAvac(budget);
  return <><div className="eyebrow">PROJECT SYSTEM</div><h1>Availability Control</h1><p>Assigned = PR + open PO + alokasi stok Q (lab) + actual. Transisi memindahkan komitmen tanpa menghitung dua kali; melebihi 100% ditolak.</p><div className="form-grid"><label>Released budget USD<input value={released} onChange={e => setReleased(e.target.value)} /></label><div><button onClick={updateRelease}>Tetapkan budget</button></div><label>Transaksi<select value={operation} onChange={e => setOperation(e.target.value as CommitmentOperation)}>{operations.map(o => <option value={o.code} key={o.code}>{o.label}</option>)}</select></label><label>Nilai USD<input value={amount} onChange={e => setAmount(e.target.value)} /></label></div><div className="actions"><button className="primary" onClick={execute}>Terapkan transaksi</button><button onClick={() => { setBudget(initial); setReleased('100000'); setError(''); }}>Reset sandbox</button></div><div className="mapping">{Object.entries({ 'PR commitment': budget.pr, 'PO commitment': budget.po, 'Held Q (lab)': budget.heldQ, 'Actual cost': budget.actual, Assigned: status.assigned, Available: status.available }).map(([name, value]) => <div key={name}><b>{name}</b><span>{formatMoney(value)}</span></div>)}</div><div className={`notice ${error ? 'error' : ''}`}>{error || `${status.status} · ${status.percent}% budget digunakan`}</div><small>MIRO tanpa selisih tidak membuat commitment baru atau actual kedua kali. Held Q bukan baris COOI procurement.</small></>;
}
