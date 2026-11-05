import { useState, type FormEvent } from 'react';
import { CenterPanel } from './components/CenterPanel';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { useSapStore } from './store/use-sap-store';

export default function App() {
  const [command, setCommand] = useState('');
  const store = useSapStore();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (command.trim().toUpperCase() === '/NEND' && !window.confirm('Tutup semua sesi navigasi lab? Data kasus tetap ada sampai halaman dimuat ulang.')) return;
    store.command(command);
    setCommand('');
  };
  return <div className="app">
    <header className="header">
      <div className="brand"><span className="logo">SAP</span><div><strong>Mastery Lab</strong><small>MM · PS · FI</small></div></div>
      <div className="header-center"><span className="education">Pendidikan · bukan sistem SAP</span><form className="command" onSubmit={submit}><span aria-hidden="true">⌘</span><input aria-label="SAP GUI Command Field" placeholder="T-Code, /nMIGO, /oMIRO, /i" value={command} onChange={event => setCommand(event.target.value)} /><button type="submit">Jalankan</button></form></div>
      <div className="header-right"><label>Proyeksi tabel<select aria-label="Edisi SAP" value={store.edition} onChange={event => store.setEdition(event.target.value === 'ECC' ? 'ECC' : 'S4')}><option value="S4">S/4HANA on-premise/private</option><option value="ECC">ECC 6.0</option></select></label><small>Kasus {store.state.caseStatus} · {store.state.journals.length} jurnal</small></div>
    </header>
    <div className="session-bar" aria-label="Sesi navigasi lab">
      <span>Sesi lab · data kasus bersama:</span>{store.sessions.map((session, index) => <button type="button" key={index} aria-pressed={index === store.activeSession} className={index === store.activeSession ? 'active-session' : ''} disabled={index === store.activeSession} onClick={() => store.selectSession(index)}>{index + 1}: {session}</button>)}
    </div>
    {store.notice && <div role="status" className="command-notice">{store.notice}</div>}
    <div className="shell"><LeftPanel /><CenterPanel /><RightPanel /></div>
  </div>;
}
