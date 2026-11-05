import { useState } from 'react';
import { caseActions } from '../data/capex-case';
import { calculateAvac } from '../lib/sap-engine';
import { formatMoney } from '../lib/sap-money';
import { projectSapTables } from '../lib/sap-tables';
import { useSapStore } from '../store/use-sap-store';

export function RightPanel() {
  const { state, edition, sandboxJournal } = useSapStore();
  const [tab, setTab] = useState<'journal' | 'budget' | 'tables'>('journal');
  const [table, setTable] = useState('BKPF'); const [query, setQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const action = caseActions[state.caseAction - 1];
  const lastJournal = state.journals[state.journals.length - 1];
  const defaultJournal = sandboxJournal ?? (lastJournal?.description === action?.title ? lastJournal : lastJournal);
  const journal = selectedDocId
    ? (selectedDocId === 'SANDBOX' && sandboxJournal ? sandboxJournal : state.journals.find(j => j.id === selectedDocId) ?? defaultJournal)
    : defaultJournal;
  const debit = journal?.lines.filter(l => l.side === 'DEBIT').reduce((sum, l) => sum + l.amount, 0n) ?? 0n;
  const credit = journal?.lines.filter(l => l.side === 'CREDIT').reduce((sum, l) => sum + l.amount, 0n) ?? 0n;
  const tables = projectSapTables(state, edition); const rows = (tables[table] ?? []).filter(row => Object.values(row).some(value => value.toLowerCase().includes(query.toLowerCase())));
  const total = state.budgets.reduce((a, b) => ({ id: 'TOTAL', label: 'Total proyek', released: a.released + b.released, pr: a.pr + b.pr, po: a.po + b.po, heldQ: a.heldQ + b.heldQ, actual: a.actual + b.actual }), { id: 'TOTAL', label: 'Total proyek', released: 0n, pr: 0n, po: 0n, heldQ: 0n, actual: 0n });
  return <aside className="panel right"><div className="inspector-title"><span>LIVE INSPECTOR</span><b>● LIVE</b></div><div className="panel-tabs">{([['journal','FI Jurnal'], ['budget','PS Budget'], ['tables','SE16N']] as const).map(([id, label]) => <button className={tab === id ? 'active' : ''} key={id} onClick={() => setTab(id)}>{label}</button>)}</div>
    {tab === 'journal' && <><h2>Accounting Journal</h2>{(state.journals.length > 0 || sandboxJournal) && <select value={selectedDocId} onChange={e => setSelectedDocId(e.target.value)}><option value="">Terbaru / Aktif</option>{sandboxJournal && <option value="SANDBOX">SANDBOX · {sandboxJournal.tcode}</option>}{state.journals.map(j => <option key={j.id} value={j.id}>{j.id} · {j.tcode} ({j.type})</option>)}</select>}{journal ? <><div className="journal-head"><b>{journal.tcode}</b><span>BKPF {journal.id} · {journal.type}</span><small>{journal.description}</small></div>{journal.lines.length ? <><div className="table-wrap"><table><thead><tr><th>Akun / PK</th><th>Debit</th><th>Kredit</th></tr></thead><tbody>{journal.lines.map((l, i) => <tr key={i}><td><b>{l.account}</b><small>{l.label} · {l.postingKey}{l.specialGl ? ` / ${l.specialGl}` : ''}{l.obyc ? ` · ${l.obyc}` : ''}</small></td><td>{l.side === 'DEBIT' ? formatMoney(l.amount) : '—'}</td><td>{l.side === 'CREDIT' ? formatMoney(l.amount) : '—'}</td></tr>)}</tbody></table></div><div className="balance">{debit === credit ? '✓ Seimbang' : '⚠ Tidak seimbang'} · Dr {formatMoney(debit)} / Cr {formatMoney(credit)}</div></> : <p>{journal.description}</p>}</> : <p>Belum ada jurnal FI. Pembuatan proyek dan PO tidak membentuk jurnal; MIGO 103 dan 311 juga tidak membentuk jurnal FI.</p>}</>}
    {tab === 'budget' && <><h2>WBS Budget & AVAC</h2>{[...state.budgets, total].map(b => { const result = calculateAvac(b); return <div className="budget-card" key={b.id}><strong>{b.label}</strong><small>{b.id} · {result.status}</small><div className="progress"><span style={{ width: `${Math.max(0, Math.min(100, result.percent))}%` }} /></div><div className="budget-row"><span>Released Budget</span><b>{formatMoney(b.released)}</b></div><div className="budget-row"><span>PR Commitment</span><b>{formatMoney(b.pr)}</b></div><div className="budget-row"><span>Open PO Commitment</span><b>{formatMoney(b.po)}</b></div><div className="budget-row"><span>Held Q allocation (lab)</span><b>{formatMoney(b.heldQ)}</b></div><div className="budget-row"><span>Actual Cost</span><b>{formatMoney(b.actual)}</b></div><div className="budget-row"><span>Assigned / Available</span><b>{formatMoney(result.assigned)} / {formatMoney(result.available)}</b></div>{result.status === 'ERROR' && <div className="notice error">BP 604 Budget Exceeded</div>}</div>; })}<small>Held Q adalah alokasi lab, bukan baris commitment COOI SAP.</small></>}
    {tab === 'tables' && <><h2>SE16N Table Inspector</h2><p>Proyeksi sintetis kolom terpilih, bukan DDIC SAP lengkap.</p><select value={table} onChange={e => setTable(e.target.value)}>{Object.keys(tables).sort().map(t => <option key={t}>{t}</option>)}</select><input placeholder="Cari nilai tabel..." value={query} onChange={e => setQuery(e.target.value)} />{rows.length ? <div className="table-wrap"><table><thead><tr>{Object.keys(rows[0]).map(k => <th key={k}>{k}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{Object.keys(rows[0]).map(key => <td key={key}>{row[key] ?? '—'}</td>)}</tr>)}</tbody></table></div> : <p>Belum ada baris untuk tabel ini.</p>}</>}
  </aside>;
}
