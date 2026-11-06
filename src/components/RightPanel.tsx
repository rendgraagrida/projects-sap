import { useEffect, useState } from 'react';
import { caseActions } from '../data/capex-case';
import { caseStepDetails } from '../data/case-step-details';
import { salesCaseActions } from '../data/sales-case';
import { salesStepDetails } from '../data/sales-step-details';
import { calculateAvac } from '../lib/sap-engine';
import { formatMoney } from '../lib/sap-money';
import { projectSapTables } from '../lib/sap-tables';
import { useSapStore } from '../store/use-sap-store';

export function RightPanel() {
  const { state, edition, view, sandboxJournal, avacBudget, selectedStepId, setSelectedStepId, simTrack, salesState, selectedSalesStepId, setSelectedSalesStepId } = useSapStore();
  const previewMode = ['migo', 'miro', 'settlement'].includes(view);
  const [tab, setTab] = useState<'detail' | 'journal' | 'budget' | 'tables'>('detail');
  const [table, setTable] = useState('BKPF');
  const [query, setQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  useEffect(() => {
    setSelectedDocId('');
    if (view === 'avac') setTab('budget');
    else if (sandboxJournal || previewMode) setTab('journal');
    else if (view === 'case') setTab('detail');
    else setTab('detail');
  }, [view, sandboxJournal, previewMode, state.caseAction, salesState.salesAction, simTrack]);
  const isSalesTrack = view === 'case' && simTrack === 'sales';
  const activeAction = isSalesTrack
    ? (salesCaseActions.find(a => a.id === selectedSalesStepId) ?? salesCaseActions[Math.max(0, Math.min(salesCaseActions.length - 1, salesState.salesAction > 0 ? salesState.salesAction - 1 : 0))])
    : (view === 'case' ? caseActions.find(a => a.id === selectedStepId) ?? caseActions[Math.max(0, Math.min(caseActions.length - 1, state.caseAction > 0 ? state.caseAction - 1 : 0))] : undefined);
  const activeDetail = isSalesTrack ? (activeAction ? salesStepDetails[activeAction.id] : undefined) : (activeAction ? caseStepDetails[activeAction.id] : undefined);
  const activeIndex = activeAction ? (isSalesTrack ? salesCaseActions.findIndex(a => a.id === activeAction.id) : caseActions.findIndex(a => a.id === activeAction.id)) : 0;
  const stepIsDone = isSalesTrack ? activeIndex < salesState.salesAction : activeIndex < state.caseAction;
  const stepIsCurrent = isSalesTrack ? activeIndex === salesState.salesAction : activeIndex === state.caseAction;
  const journalsList = isSalesTrack ? salesState.journals : state.journals;
  const defaultJournal = sandboxJournal ?? (previewMode ? undefined : journalsList[journalsList.length - 1]);
  const journal = selectedDocId ? selectedDocId === 'SANDBOX' ? sandboxJournal : journalsList.find(item => item.id === selectedDocId) : defaultJournal;
  const debit = journal?.lines.filter(line => line.side === 'DEBIT').reduce((sum, line) => sum + line.amount, 0n) ?? 0n;
  const credit = journal?.lines.filter(line => line.side === 'CREDIT').reduce((sum, line) => sum + line.amount, 0n) ?? 0n;
  const tables = projectSapTables(state, edition);
  const activeTable = table in tables ? table : 'BKPF';
  const rows = (tables[activeTable] ?? []).filter(row => Object.values(row).some(value => value.toLowerCase().includes(query.toLowerCase().trim())));
  const columns = [...new Set(rows.flatMap(row => Object.keys(row)))];
  const budgets = view === 'avac' ? [avacBudget] : state.budgets;
  const total = budgets.reduce((sum, budget) => ({ ...sum, released: sum.released + budget.released, pr: sum.pr + budget.pr, po: sum.po + budget.po, heldQ: sum.heldQ + budget.heldQ, actual: sum.actual + budget.actual }), { id: 'TOTAL', label: 'Total proyek', released: 0n, pr: 0n, po: 0n, heldQ: 0n, actual: 0n });
  return <aside className="panel right" aria-label="Inspector hasil lab">
    <div className="inspector-title"><span>INSPECTOR LAB</span><b>DATA SINTETIS</b></div>
    <nav className="panel-tabs" aria-label="Jenis hasil inspector">{([['detail', 'Detail Langkah'], ['journal','FI Jurnal'], ['budget','PS Budget'], ['tables','SE16N']] as const).map(([id, label]) => <button type="button" aria-pressed={tab === id} className={tab === id ? 'active' : ''} key={id} onClick={() => setTab(id)}>{label}</button>)}</nav>
    {tab === 'detail' && <section className="step-inspector-card" aria-label="Detail dan log perubahan langkah">
      <h2>Detail & Log Perubahan</h2>
      {activeAction && activeDetail ? <>
        <label>Pilih langkah yang diinspeksi
          <select value={activeAction.id} onChange={event => isSalesTrack ? setSelectedSalesStepId(event.target.value) : setSelectedStepId(event.target.value)}>
            {isSalesTrack
              ? salesCaseActions.map(a => <option key={a.id} value={a.id}>Langkah {a.step}: {a.title} ({a.tcode})</option>)
              : caseActions.map(a => <option key={a.id} value={a.id}>Langkah {a.step}: {a.title} ({a.tcode})</option>)}
          </select>
        </label>
        <div className="inspector-step-header">
          <div className="eyebrow">{activeDetail.module} · LANGKAH {activeAction.step}</div>
          <h3 className="step-title">{activeAction.title}</h3>
          <div className="detail-chip"><strong>{activeAction.tcode}</strong> · {activeDetail.sapStatus}</div>
          <div className="step-status-indicator">
            {stepIsDone ? <span className="status-badge done">✓ Sudah selesai tereksekusi</span> : stepIsCurrent ? <span className="status-badge current">⏳ Siap dieksekusi (Langkah berikutnya)</span> : <span className="status-badge pending">🔒 Menunggu langkah sebelumnya</span>}
          </div>
        </div>
        <div className="detail-explanation-box">
          <strong>Tujuan Bisnis:</strong>
          <p>{activeDetail.businessPurpose}</p>
        </div>
        <div className="inspector-section">
          <h4>Data Input & Parameter:</h4>
          <ul>{activeDetail.inputData.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
        </div>
        <div className="inspector-section">
          <h4>Perubahan Sistem & Status:</h4>
          <ul>{activeDetail.systemChanges.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
        </div>
        <div className="inspector-section">
          <h4>Tabel Database SAP Terpengaruh:</h4>
          <div className="db-tags-list">
            {activeDetail.dbImpact.map(item => <div key={item.table} className="db-tag-card"><span className="table-badge">{item.table}</span><small>{item.description}</small></div>)}
          </div>
          <button type="button" className="link-button" onClick={() => setTab('tables')}>Buka tabel di tab SE16N →</button>
        </div>
        <div className="inspector-section journal-section">
          <h4>Dampak Jurnal Akuntansi (FI-GL):</h4>
          <p className="journal-note-text">{activeDetail.fiJournalNote}</p>
          {activeDetail.hasJournal && <button type="button" className="link-button" onClick={() => setTab('journal')}>Lihat posting debit/kredit di tab FI Jurnal →</button>}
        </div>
        <div className="inspector-section avac-section">
          <h4>{isSalesTrack ? 'Dampak Finansial Penjualan:' : 'Dampak Anggaran (PS AVAC):'}</h4>
          <p className="avac-note-text">{activeDetail.avacNote}</p>
          <button type="button" className="link-button" onClick={() => setTab('budget')}>Lihat pergerakan {isSalesTrack ? 'finansial penjualan' : 'anggaran'} di tab {isSalesTrack ? 'Finansial SD' : 'PS Budget'} →</button>
        </div>
      </> : <p>{view === 'case' ? 'Pilih salah satu langkah Simulation di panel tengah untuk melihat detail perubahannya.' : 'Detail langkah tampil saat tab Simulation aktif.'}</p>}
    </section>}
    {tab === 'journal' && <>
      <h2>Jurnal akuntansi</h2>
      {(journalsList.length > 0 || sandboxJournal) && <label>Dokumen sumber<select value={journal?.id ?? ''} onChange={event => setSelectedDocId(event.target.value)}>
        {!journal && <option value="" disabled>Pilih riwayat kasus atau buat pratinjau</option>}
        {sandboxJournal && <option value="SANDBOX">Pratinjau aktif · {sandboxJournal.tcode}</option>}
        {journalsList.map(item => <option key={item.id} value={item.id}>{isSalesTrack ? 'Sales' : 'Simulation'} · {item.id} · {item.tcode}</option>)}
      </select></label>}
      {journal ? <>
        <div className="journal-head"><b>{journal.tcode}</b><span>{journal.id === 'SANDBOX' ? 'Pratinjau, tidak diposting ke Simulation' : `${isSalesTrack ? 'Sales' : 'Simulation'} · ${journal.id}`} · {journal.type}</span><small>{journal.description}</small></div>
        {journal.lines.length ? <><div className="table-wrap"><table><caption className="sr-only">Jurnal debit dan kredit {journal.tcode}</caption><thead><tr><th>Akun / PK</th><th>Debit</th><th>Kredit</th></tr></thead><tbody>{journal.lines.map((line, index) => <tr key={index}><td><b>{line.account}</b> / {line.postingKey}<small>{line.label}{line.obyc ? ` · ${line.obyc}` : ''}{line.specialGl ? ` · Special G/L ${line.specialGl}` : ''}{line.wbs ? ` · ${line.wbs}` : ''}{line.costCenter ? ` · CC ${line.costCenter}` : ''}{line.order ? ` · Order ${line.order}` : ''}{line.network ? ` · Network ${line.network}` : ''}</small></td><td>{line.side === 'DEBIT' ? formatMoney(line.amount) : '—'}</td><td>{line.side === 'CREDIT' ? formatMoney(line.amount) : '—'}</td></tr>)}</tbody><tfoot><tr><th>Total</th><td>{formatMoney(debit)}</td><td>{formatMoney(credit)}</td></tr></tfoot></table></div><p role="status" className={debit === credit ? 'balance' : 'notice error'}>{debit === credit ? 'Debit = Kredit · seimbang' : 'Jurnal tidak seimbang'}</p></> : <p role="status">Tidak ada jurnal FI untuk pratinjau ini.</p>}
      </> : <p>{previewMode ? 'Belum ada hasil pratinjau aktif. Isi form dan jalankan perhitungannya; riwayat Simulation tetap dapat dipilih.' : 'Jalankan aksi Simulation untuk melihat jurnalnya.'}</p>}
    </>}
    {tab === 'budget' && <>
      {isSalesTrack ? <>
        <h2>Finansial Penjualan SD (O2C)</h2><p>Rekapitulasi nilai pesanan komersial, pendapatan terakru, piutang pelanggan, dan realisasi kas.</p>
        <div className="budget-card">
          <strong>MetroNexia Enterprise O2C</strong><small>Status: {salesState.status}</small>
          <div className="progress"><span style={{ width: `${salesState.contractValue > 0n ? Math.min(100, Number((salesState.cashCollected * 100n) / (salesState.revenueMrc + salesState.revenueOtc + salesState.taxOutput || 1n))) : 0}%` }} /></div>
          <div className="budget-row"><span>Nilai Kontrak Pesanan</span><b>{formatMoney(salesState.contractValue)}</b></div>
          <div className="budget-row"><span>Pendapatan OTC (Aktivasi)</span><b>{formatMoney(salesState.revenueOtc)}</b></div>
          <div className="budget-row"><span>Pendapatan MRC (Internet)</span><b>{formatMoney(salesState.revenueMrc)}</b></div>
          <div className="budget-row"><span>Hutang PPN Keluaran (11%)</span><b>{formatMoney(salesState.taxOutput)}</b></div>
          <div className="budget-row"><span>Piutang Usaha Berjalan</span><b>{formatMoney(salesState.receivables)}</b></div>
          <div className="budget-row"><span>Total Kas Diterima di Bank</span><b>{formatMoney(salesState.cashCollected)}</b></div>
        </div>
      </> : <>
        <h2>{view === 'avac' ? 'Budget sandbox AVAC' : 'Budget Simulation'}</h2><p>Nilai agregat fixture; reservasi Q adalah kebijakan lab, bukan saldo COOI SAP.</p>
        {(budgets.length > 1 ? [...budgets, total] : budgets).map(budget => {
          const result = calculateAvac(budget);
          return <div className="budget-card" key={budget.id}><strong>{budget.label}</strong><small>{budget.id} · {result.status}</small><div className="progress"><span style={{ width: `${Math.max(0, Math.min(100, result.percent))}%` }} /></div>{Object.entries({ 'Released budget': budget.released, 'PR commitment': budget.pr, 'Open PO commitment': budget.po, 'Reservasi Q (lab)': budget.heldQ, Actual: budget.actual, Assigned: result.assigned, Available: result.available }).map(([label, value]) => <div className="budget-row" key={label}><span>{label}</span><b>{formatMoney(value)}</b></div>)}</div>;
        })}
      </>}
    </>}
    {tab === 'tables' && <>
      <h2>SE16N · proyeksi kasus</h2><p>Kolom terpilih sintetis {edition === 'S4' ? 'S/4HANA' : 'ECC'}. Bukan DDIC lengkap; pratinjau MIGO/MIRO tidak menambah baris di sini.</p>
      <label>Tabel proyeksi<select value={activeTable} onChange={event => { setTable(event.target.value); setQuery(''); }}>{Object.keys(tables).sort().map(name => <option key={name}>{name}</option>)}</select></label>
      <input aria-label="Filter baris tabel" placeholder="Cari nilai tabel..." value={query} onChange={event => setQuery(event.target.value)} />
      {rows.length ? <div className="table-wrap"><table><caption className="sr-only">Proyeksi sintetis {activeTable}</caption><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{row[column] ?? '—'}</td>)}</tr>)}</tbody></table></div> : <p role="status">Tidak ada baris yang cocok pada proyeksi ini.</p>}
    </>}
  </aside>;
}
