import { useState, type FormEvent } from 'react';
import { CenterPanel } from './components/CenterPanel';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { useSapStore } from './store/use-sap-store';

export default function App() {
  const [command, setCommand] = useState('');
  const store = useSapStore();
  const submit = (event: FormEvent) => { event.preventDefault(); store.command(command); setCommand(''); };
  return <div className="app">
    <header className="header">
      <div className="brand"><span className="logo">SAP</span><div><strong>Mastery Lab</strong><small>MM · PS · FI</small></div></div>
      <div className="header-center"><span className="education">Simulasi pendidikan — bukan koneksi SAP</span><form className="command" onSubmit={submit}><span>⌘</span><input aria-label="SAP GUI Command Field" placeholder="Masukkan T-Code, contoh /nMIGO" value={command} onChange={e => setCommand(e.target.value)} /><button type="submit">Jalankan ↵</button></form></div>
      <div className="header-right"><select aria-label="Edisi SAP" value={store.edition} onChange={e => store.setEdition(e.target.value === 'ECC' ? 'ECC' : 'S4')}><option value="S4">SAP S/4HANA</option><option value="ECC">SAP ECC 6.0</option></select><small>WBS {store.state.caseStatus} · {store.state.journals.length} jurnal</small></div>
    </header>
    <div className="session-bar">Sesi SAP GUI: {store.sessions.map((s, i) => <button key={i} className={i === store.activeSession ? 'active-session' : ''} onClick={() => store.selectSession(i)}>{i + 1}: {s}</button>)}</div>
    <div className="shell"><LeftPanel /><CenterPanel /><RightPanel /></div>
  </div>;
}
