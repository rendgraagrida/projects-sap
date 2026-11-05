import { useEffect, useRef, useState } from 'react';
import { caseActions } from '../data/capex-case';
import { dictionaries, modules, quiz } from '../data/curriculum';
import { accounts, taxCodes } from '../data/sap-config';
import { simulateMigo } from '../lib/migo-engine';
import { calculateDepreciation, settleProject } from '../lib/project-engine';
import { simulateMiro } from '../lib/sap-engine';
import { formatMoney, parseMoney } from '../lib/sap-money';
import { evaluateQuiz } from '../lib/study-engine';
import { useSapStore } from '../store/use-sap-store';
import type { PriceControl } from '../types/sap';
import { AvacSandbox } from './AvacSandbox';
import { MarkdownReader } from './MarkdownReader';

function MigoLab() {
  const store = useSapStore();
  const [movement, setMovement] = useState('101');
  const [amount, setAmount] = useState('50000');
  const [projectStock, setProjectStock] = useState(false);
  const [wbs, setWbs] = useState('P-2026-TINF01.02');
  const [assignment, setAssignment] = useState('');
  const [feedback, setFeedback] = useState({ text: '', error: false });
  return <>
    <div className="eyebrow">MATERIALS MANAGEMENT · PRATINJAU NILAI</div>
    <h1>MIGO & OBYC</h1>
    <p>Pratinjau jurnal untuk nilai yang dimasukkan. Tidak mengelola kuantitas, PO, penerimaan sebelumnya, atau mengubah stok kasus Simulation. Akun dan movement adalah fixture lab; tidak menggantikan konfigurasi SAP.</p>
    <form onSubmit={event => {
      event.preventDefault();
      const value = parseMoney(amount);
      if (!value.ok) { store.setSandboxJournal(null); setFeedback({ text: value.error, error: true }); return; }
      const result = simulateMigo({ movement, amount: value.value, projectStock, wbs, costCenter: movement === '201' ? assignment : undefined, order: movement === '261' ? assignment : undefined, network: movement === '281' ? assignment : undefined });
      store.setSandboxJournal(result.ok ? result.value : null);
      setFeedback({ text: result.ok ? result.value.description : result.error, error: !result.ok });
    }}>
      <div className="form-grid">
        <label>Movement type<select value={movement} onChange={event => { setMovement(event.target.value); setAssignment(''); setFeedback({ text: '', error: false }); store.setSandboxJournal(null); }}>{['101','103','105','122','201','221','261','281','301','311','411','412','551','561','701','702'].map(code => <option key={code}>{code}</option>)}</select></label>
        <label>Nilai pergerakan USD<input inputMode="decimal" value={amount} onChange={event => setAmount(event.target.value)} /></label>
        <label>WBS<input value={wbs} onChange={event => setWbs(event.target.value)} /></label>
        <label className="check"><input type="checkbox" checked={projectStock} onChange={event => setProjectStock(event.target.checked)} /> Stok khusus proyek Q</label>
        {['201','261','281'].includes(movement) && <label>{movement === '201' ? 'Cost center' : movement === '261' ? 'Order produksi' : 'Network'}<input value={assignment} onChange={event => setAssignment(event.target.value)} /></label>}
      </div>
      <button type="submit" className="primary">Hitung jurnal pergerakan</button>
    </form>
    {feedback.text && <div role={feedback.error ? 'alert' : 'status'} className={`notice ${feedback.error ? 'error' : ''}`}>{feedback.text}</div>}
    <h2>Mapping akun OBYC khusus lab</h2>
    <div className="mapping">{Object.entries(accounts).map(([key, value]) => <div key={key}><b>{key}</b><span>{value}</span></div>)}</div>
  </>;
}

function MiroLab() {
  const store = useSapStore();
  const [gr, setGr] = useState('50000');
  const [invoice, setInvoice] = useState('50000');
  const [fx, setFx] = useState('0');
  const [fxSide, setFxSide] = useState('loss');
  const [control, setControl] = useState<PriceControl>('V');
  const [coverage, setCoverage] = useState('100');
  const [tax, setTax] = useState<keyof typeof taxCodes>('V1');
  const [withholding, setWithholding] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', error: false });
  return <>
    <div className="eyebrow">LOGISTICS INVOICE VERIFICATION · PRATINJAU JURNAL</div>
    <h1>MIRO · nilai dan selisih</h1>
    <p>Model nilai USD dengan kuantitas yang dianggap cocok. Tidak menjalankan pencocokan PO–GR–invoice, pemeriksaan invoice duplikat, atau payment blocking SAP. Stock coverage dan selisih kurs diinput untuk mempelajari jurnal; tarif pajak adalah fixture, bukan tarif hukum terkini.</p>
    <form onSubmit={event => {
      event.preventDefault();
      const a = parseMoney(gr), b = parseMoney(invoice), c = parseMoney(fx);
      if (!a.ok || !b.ok || !c.ok || !coverage.trim()) {
        store.setSandboxJournal(null);
        setFeedback({ text: 'Isi nilai nonnegatif dengan maksimal dua desimal dan stock coverage 0–100%.', error: true });
        return;
      }
      const result = simulateMiro({ grValue: a.value, invoiceValue: b.value, fxDifference: fxSide === 'gain' ? -c.value : c.value, priceControl: control, stockCoveragePercent: Number(coverage), taxCode: tax, withholding });
      store.setSandboxJournal(result.ok ? result.value : null);
      setFeedback({ text: result.ok ? result.value.description : result.error, error: !result.ok });
    }}>
      <div className="form-grid">
        <label>Nilai GR historis USD<input inputMode="decimal" value={gr} onChange={event => setGr(event.target.value)} /></label>
        <label>Nilai invoice sebelum selisih kurs USD<input inputMode="decimal" value={invoice} onChange={event => setInvoice(event.target.value)} /></label>
        <label>Besar selisih kurs USD<input inputMode="decimal" value={fx} onChange={event => setFx(event.target.value)} /></label>
        <label>Arah selisih kurs<select value={fxSide} onChange={event => setFxSide(event.target.value)}><option value="loss">Rugi / utang bertambah</option><option value="gain">Laba / utang berkurang</option></select></label>
        <label>Price control<select value={control} onChange={event => setControl(event.target.value as PriceControl)}><option value="V">V · Moving Average Price</option><option value="S">S · Standard Price</option></select></label>
        <label>Stock coverage (%)<input inputMode="numeric" value={coverage} onChange={event => setCoverage(event.target.value)} /></label>
        <label>Tax code fixture<select value={tax} onChange={event => setTax(event.target.value as keyof typeof taxCodes)}>{Object.entries(taxCodes).filter(([, value]) => value.kind === 'INPUT').map(([code, value]) => <option key={code} value={code}>{code} · {value.rate}% · {value.deductible ? 'deductible' : 'non-deductible'}</option>)}</select></label>
        <label className="check"><input type="checkbox" checked={withholding} onChange={event => setWithholding(event.target.checked)} /> Withholding 2% (asumsi fixture saat invoice)</label>
      </div>
      <button type="submit" className="primary">Hitung jurnal invoice</button>
    </form>
    {feedback.text && <div role={feedback.error ? 'alert' : 'status'} className={`notice ${feedback.error ? 'error' : ''}`}>{feedback.text}</div>}
  </>;
}

function SettlementLab() {
  const store = useSapStore();
  const [amount, setAmount] = useState('50000');
  const [wbs, setWbs] = useState('P-2026-TINF01.02');
  const [assetClass, setAssetClass] = useState<'2000' | '3000'>('3000');
  const [mode, setMode] = useState<'PERIODIC' | 'FULL'>('PERIODIC');
  const [feedback, setFeedback] = useState({ text: '', error: false });
  const finalAssets = store.state.assets.filter(asset => asset.assetClass !== '8000' && asset.value > asset.depreciation);
  return <>
    <div className="eyebrow">ASSET ACCOUNTING · PRATINJAU</div><h1>CJ88 & AFAB</h1>
    <p>Contoh jurnal settlement untuk nilai dan WBS yang dimasukkan. Tidak mem-posting ulang kasus, tidak memvalidasi settlement rule atau saldo sender SAP. Kelas aset 8000/2000/3000 adalah konfigurasi contoh. Penyusutan mengikuti masa manfaat dan periode yang telah diposting pada aset kasus.</p>
    <form onSubmit={event => {
      event.preventDefault();
      const value = parseMoney(amount);
      if (!value.ok) { store.setSandboxJournal(null); setFeedback({ text: value.error, error: true }); return; }
      const result = settleProject(value.value, mode, assetClass, wbs);
      store.setSandboxJournal(result.ok ? result.value : null);
      setFeedback({ text: result.ok ? result.value.description : result.error, error: !result.ok });
    }}>
      <div className="form-grid">
        <label>Nilai settlement USD<input inputMode="decimal" value={amount} onChange={event => setAmount(event.target.value)} /></label>
        <label>WBS sender<input value={wbs} onChange={event => setWbs(event.target.value)} /></label>
        <label>Jenis settlement<select value={mode} onChange={event => setMode(event.target.value as 'PERIODIC' | 'FULL')}><option value="PERIODIC">Periodic · WBS ke AuC</option><option value="FULL">Full · AuC ke aset final</option></select></label>
        {mode === 'FULL' && <label>Kelas aset final contoh<select value={assetClass} onChange={event => setAssetClass(event.target.value as '2000' | '3000')}><option value="2000">2000 · Bangunan</option><option value="3000">3000 · Mesin</option></select></label>}
      </div>
      <button type="submit" className="primary">Hitung jurnal settlement</button>
    </form>
    <h2>Aset sumber pratinjau AFAB: Simulation</h2>
    {!store.state.assets.length && <p>Belum ada aset. Jalankan Simulation sampai kapitalisasi untuk mempelajari penyusutan.</p>}
    <div className="mapping">{store.state.assets.map(asset => <div key={asset.id}><b>{asset.id} · Kelas {asset.assetClass}</b><span>{formatMoney(asset.value)} · Akumulasi {formatMoney(asset.depreciation)}</span></div>)}</div>
    <button type="button" disabled={!finalAssets.length} onClick={() => {
      const result = calculateDepreciation(store.state.assets);
      store.setSandboxJournal(result.ok ? result.value : null);
      setFeedback({ text: result.ok ? 'Pratinjau periode berikutnya; nilai aset kasus tidak diubah.' : result.error, error: !result.ok });
    }}>Pratinjau penyusutan periode berikutnya</button>
    {feedback.text && <div role={feedback.error ? 'alert' : 'status'} className={`notice ${feedback.error ? 'error' : ''}`}>{feedback.text}</div>}
  </>;
}

export function CenterPanel() {
  const store = useSapStore();
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!root.current) return;
    if (store.view !== 'reader' || !store.readerAnchor) root.current.scrollTop = 0;
    if (window.matchMedia('(max-width: 700px)').matches) root.current.scrollIntoView({ block: 'start' });
  }, [store.view, store.selectedDictionary?.code, store.activeQuiz, store.moduleId, store.readerRequest, store.readerAnchor]);
  const module = modules.find(item => item.id === store.moduleId) ?? modules[0];
  const entry = dictionaries.find(item => item.code === store.selectedDictionary?.code && item.category === store.selectedDictionary.category);
  const question = quiz.find(item => item.id === store.activeQuiz) ?? quiz[0];
  const answered = question && question.id in store.quizAnswers;
  return <main className="panel center" aria-label="Materi dan laboratorium" ref={root}>
    <nav className="workspace-tabs" aria-label="Laboratorium">
      {([['case', 'Simulation'], ['migo', 'MIGO & OBYC'], ['miro', 'MIRO'], ['avac', 'AVAC'], ['settlement', 'CJ88 & AFAB']] as const).map(([id, label]) => <button type="button" key={id} aria-pressed={store.view === id} className={store.view === id ? 'active' : ''} onClick={() => store.setView(id)}>{label}</button>)}
    </nav>
    {store.view === 'reader' && <>
      <div className="reader-heading"><span>MODUL {module.id} / {modules.length}</span><button type="button" disabled={store.completed.includes(module.id)} onClick={store.markComplete}>{store.completed.includes(module.id) ? 'Selesai dibaca' : 'Tandai selesai'}</button></div>
      <MarkdownReader markdown={module.rawMarkdown} onModule={store.openModule} anchor={store.readerAnchor} request={store.readerRequest} />
    </>}
    {store.view === 'dictionary' && <section className="dictionary-detail-card" aria-label="Keterangan kamus">
      <div className="eyebrow">KAMUS KONSULTAN SAP · {entry?.category ?? 'REFERENSI'}</div>
      {entry ? <>
        <h1>{entry.code}</h1><p className="lead-description">{entry.description}</p>
        <div className="detail-chip">Referensi / padanan: {entry.detail}</div>
        <h2>Keterangan dan batas penerapan</h2>
        <div className="detail-explanation-box">{entry.explanation?.split('\n').map((line, index) => <p key={index}>{line}</p>)}</div>
        <p>Rujukan fungsi umum; ketersediaan transaksi, aplikasi Fiori, dan konfigurasi mengikuti edisi serta release SAP. Bukan koneksi ke sistem SAP perusahaan.</p>
        {entry.sources?.length ? <section aria-label="Sumber resmi kamus"><h2>Sumber resmi</h2><ul>{entry.sources.filter(source => /^https:\/\//i.test(source.url)).map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul></section> : null}
      </> : <><h1>Kamus SAP</h1><p>Pilih entri yang sesuai di daftar kamus. Tidak ada entri yang cocok dengan filter saat ini.</p></>}
    </section>}
    {store.view === 'quiz' && <section aria-label="Latihan pemahaman">
      <div className="eyebrow">LATIHAN · BUKAN UJIAN SERTIFIKASI SAP</div>
      {question && <>
        <h1>{question.title}</h1><MarkdownReader markdown={question.question} onModule={store.openModule} />
        {question.options.map((option, index) => <button type="button" key={option} className={`quiz-option ${answered && store.quizAnswers[question.id] === index ? 'selected' : ''}`} disabled={answered} onClick={() => store.answerQuiz(question.id, index)}>{option}</button>)}
        {answered && <div className="quiz-feedback" role="status"><strong>{evaluateQuiz(question, store.quizAnswers[question.id]) ? 'Benar' : 'Belum tepat'}</strong><MarkdownReader markdown={question.answer} onModule={store.openModule} /></div>}
      </>}
      <button type="button" disabled={!Object.keys(store.quizAnswers).length} onClick={store.resetQuiz}>Ulangi seluruh latihan</button>
    </section>}
    {store.view === 'case' && <>
      <div className="eyebrow">KASUS SINTETIS · TELKOM INFRASTRUKTUR / MM / PS / FI</div><h1>Deployment Fiber Optic Backbone Regional</h1>
      <p>Contoh pembelajaran bisnis fiber PT Telkom Infrastruktur Indonesia (InfraNexia), bukan Telkominfra yang merupakan entitas berbeda. Budget $100,000 · actual dan kapitalisasi $90,000 · sisa $10,000. Lingkup, nilai, vendor, akun, pajak 11%, withholding 2%, WBS, dan umur manfaat adalah asumsi edukasi, bukan data internal atau kebijakan TelkomGroup. Simulasi tidak mengeksekusi transaksi SAP atau bank.</p>
      <div className="actions"><button type="button" className="primary" disabled={store.state.caseAction >= caseActions.length} onClick={store.nextCase}>Jalankan aksi berikutnya</button><button type="button" disabled={store.state.caseAction >= caseActions.length} onClick={store.runCase}>Jalankan semua aksi tersisa</button><button type="button" disabled={store.state.caseAction === 0} onClick={store.resetCase}>Reset kasus</button></div>
      <p role="status">{store.state.caseAction} / {caseActions.length} aksi selesai · Status {store.state.caseStatus}</p>
      <div className="step-list">{caseActions.map((action, index) => {
        const isDone = index < store.state.caseAction;
        const isCurrent = index === store.state.caseAction;
        const isSelected = store.selectedStepId ? store.selectedStepId === action.id : (store.state.caseAction > 0 ? index === store.state.caseAction - 1 : index === 0);
        return <div className={`step ${isDone ? 'done' : isCurrent ? 'current' : ''} ${isSelected ? 'selected' : ''}`} key={action.id} role="button" tabIndex={0} aria-current={isSelected ? 'step' : undefined} onClick={() => store.setSelectedStepId(action.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); store.setSelectedStepId(action.id); } }}>
          <span className="step-num">{isDone ? '✓' : action.step}</span>
          <div className="step-content">
            <div className="step-header-line">
              <strong>{action.title}</strong>
              <span className={`step-status-tag ${isDone ? 'done' : isCurrent ? 'current' : 'pending'}`}>{isDone ? '✓ Selesai' : isCurrent ? '⏳ Langkah berikutnya' : '🔒 Menunggu'}</span>
            </div>
            <small>{action.tcode} · {action.description}</small>
          </div>
        </div>;
      })}</div>
    </>}
    {store.view === 'migo' && <MigoLab />}
    {store.view === 'miro' && <MiroLab />}
    {store.view === 'avac' && <AvacSandbox />}
    {store.view === 'settlement' && <SettlementLab />}
  </main>;
}
