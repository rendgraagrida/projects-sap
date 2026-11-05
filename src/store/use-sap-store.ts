import { create } from 'zustand';
import { caseActions } from '../data/capex-case';
import { executeCaseAction, initialSapState, parseTCodeCommand } from '../lib/sap-engine';
import type { Journal, SapEdition, SapState } from '../types/sap';

type View = 'reader' | 'case' | 'migo' | 'miro' | 'avac' | 'settlement';
interface Store { edition: SapEdition; view: View; moduleId: string; completed: string[]; state: SapState; sandboxJournal: Journal | null; sessions: string[]; activeSession: number; notice: string; setEdition: (edition: SapEdition) => void; setView: (view: View) => void; openModule: (id: string) => void; markComplete: () => void; nextCase: () => void; runCase: () => void; resetCase: () => void; setSandboxJournal: (journal: Journal | null) => void; selectSession: (index: number) => void; command: (text: string) => void }
const route: Record<string, View> = { MIGO: 'migo', OBYC: 'migo', MIRO: 'miro', CJ20N: 'case', CJ30: 'avac', CJ32: 'avac', CJ88: 'settlement', AFAB: 'settlement', ME21N: 'case', ME29N: 'case', ML81N: 'case', 'F-48': 'case', 'F-54': 'case', F110: 'case' };
export const useSapStore = create<Store>((set, get) => ({
  edition: 'S4', view: 'reader', moduleId: '01', completed: [], state: initialSapState(), sandboxJournal: null, sessions: ['SAP Easy Access'], activeSession: 0, notice: '',
  setEdition: edition => set({ edition }), setView: view => set({ view }), openModule: moduleId => set({ moduleId, view: 'reader' }),
  markComplete: () => set(s => ({ completed: s.completed.includes(s.moduleId) ? s.completed : [...s.completed, s.moduleId] })),
  nextCase: () => set(s => { const result = executeCaseAction(s.state); return result.ok ? { state: result.value, sandboxJournal: null, notice: '' } : { notice: result.error }; }),
  runCase: () => { let state = get().state; while (state.caseAction < caseActions.length) { const result = executeCaseAction(state); if (!result.ok) { set({ notice: result.error }); return; } state = result.value; } set({ state, sandboxJournal: null }); },
  resetCase: () => set({ state: initialSapState(), sandboxJournal: null, notice: '' }), setSandboxJournal: sandboxJournal => set({ sandboxJournal }),
  selectSession: index => set(s => index >= 0 && index < s.sessions.length ? { activeSession: index, view: route[s.sessions[index]] ?? 'reader' } : {}),
  command: text => set(s => { const parsed = parseTCodeCommand(text); if (!parsed.ok) return { notice: parsed.error }; const { mode, tcode } = parsed.value; if (mode === 'end' || mode === 'exit') { const sessions = s.sessions.filter((_, i) => i !== s.activeSession); return { sessions: sessions.length ? sessions : ['SAP Easy Access'], activeSession: 0, notice: 'Sesi simulasi ditutup.' }; } if (mode === 'menu') return { view: 'reader', notice: 'SAP Easy Access' }; const sessions = [...s.sessions]; let activeSession = s.activeSession; if (mode === 'new') { if (sessions.length >= 6) return { notice: 'Maksimum enam sesi simulasi.' }; sessions.push(tcode); activeSession = sessions.length - 1; } else sessions[activeSession] = tcode; return { sessions, activeSession, view: route[tcode] ?? s.view, notice: route[tcode] ? `${tcode} dibuka.` : `${tcode}: referensi saja, tidak ada transaksi interaktif.` }; }),
}));
