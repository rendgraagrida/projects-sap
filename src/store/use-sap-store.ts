import { create } from 'zustand';
import { caseActions } from '../data/capex-case';
import { dictionaries, modules, quiz } from '../data/curriculum';
import { executeCaseAction, initialSapState, parseTCodeCommand } from '../lib/sap-engine';
import { dictionaryCodes, type DictionaryEntry } from '../lib/study-engine';
import type { Budget, Journal, SapEdition, SapState } from '../types/sap';

export type View = 'reader' | 'dictionary' | 'quiz' | 'case' | 'migo' | 'miro' | 'avac' | 'settlement';
export type StudyTab = 'modules' | 'dictionary' | 'quiz';
interface Store {
  edition: SapEdition;
  view: View;
  studyTab: StudyTab;
  moduleId: string;
  readerAnchor: string | null;
  readerRequest: number;
  completed: string[];
  state: SapState;
  sandboxJournal: Journal | null;
  avacBudget: Budget;
  selectedDictionary: DictionaryEntry | null;
  quizAnswers: Record<string, number>;
  activeQuiz: string;
  sessions: string[];
  activeSession: number;
  notice: string;
  selectedStepId: string | null;
  setSelectedStepId: (id: string | null) => void;
  setEdition: (edition: SapEdition) => void;
  setView: (view: View) => void;
  setStudyTab: (tab: StudyTab) => void;
  setSelectedDictionary: (entry: DictionaryEntry | null) => void;
  openModule: (id: string, anchor?: string) => void;
  markComplete: () => void;
  answerQuiz: (id: string, selected: number) => void;
  selectQuiz: (id: string) => void;
  resetQuiz: () => void;
  nextCase: () => void;
  runCase: () => void;
  resetCase: () => void;
  setSandboxJournal: (journal: Journal | null) => void;
  setAvacBudget: (budget: Budget) => void;
  selectSession: (index: number) => void;
  command: (text: string) => void;
}

const route: Record<string, View> = {
  MIGO: 'migo', OBYC: 'migo', MIRO: 'miro',
  CJ20N: 'case', ME21N: 'case', ME29N: 'case', ML81N: 'case',
  'F-48': 'case', 'F-54': 'case', F110: 'case',
  CJ30: 'avac', CJ32: 'avac', CJ88: 'settlement', AFAB: 'settlement',
};

function sessionNavigation(tcode: string): Partial<Store> {
  if (tcode === 'SAP Easy Access') return { view: 'reader', studyTab: 'modules' };
  const entry = dictionaries.find(d => d.category !== 'Tabel SE16N' && dictionaryCodes(d).includes(tcode));
  const view = route[tcode];
  if (view) return { view, notice: `${tcode}: laboratorium pendidikan terkait, bukan transaksi SAP nyata.` };
  return entry
    ? { view: 'dictionary', studyTab: 'dictionary', selectedDictionary: entry, notice: `${tcode}: referensi kamus, tidak ada transaksi posting interaktif.` }
    : { view: 'reader', studyTab: 'modules' };
}

export const useSapStore = create<Store>((set, get) => ({
  edition: 'S4', view: 'reader', studyTab: 'modules', moduleId: '01', readerAnchor: null, readerRequest: 0,
  completed: [], state: initialSapState(), sandboxJournal: null, selectedStepId: null,
  setSelectedStepId: selectedStepId => set({ selectedStepId }),
  avacBudget: { id: 'SANDBOX-WBS', label: 'Sandbox AVAC', released: 10000000n, pr: 0n, po: 0n, heldQ: 0n, actual: 0n },
  selectedDictionary: null, quizAnswers: {}, activeQuiz: 'case-01',
  sessions: ['SAP Easy Access'], activeSession: 0, notice: '',
  setEdition: edition => set({ edition }),
  setView: view => set(s => ({
    view, notice: '', sandboxJournal: null,
    studyTab: view === 'reader' ? 'modules' : view === 'dictionary' ? 'dictionary' : view === 'quiz' ? 'quiz' : s.studyTab,
  })),
  setStudyTab: studyTab => set(s => ({
    studyTab, view: studyTab === 'modules' ? 'reader' : studyTab, notice: '', sandboxJournal: null,
    selectedDictionary: studyTab === 'dictionary' ? s.selectedDictionary ?? dictionaries[0] ?? null : s.selectedDictionary,
  })),
  setSelectedDictionary: selectedDictionary => set({ selectedDictionary, view: 'dictionary', studyTab: 'dictionary', notice: '', sandboxJournal: null }),
  openModule: (moduleId, anchor) => {
    if (!modules.some(m => m.id === moduleId)) { set({ notice: 'Modul tidak ditemukan.' }); return; }
    set(s => ({ moduleId, readerAnchor: anchor ?? null, readerRequest: s.readerRequest + 1, studyTab: 'modules', view: 'reader', notice: '', sandboxJournal: null }));
  },
  markComplete: () => set(s => ({ completed: s.completed.includes(s.moduleId) ? s.completed : [...s.completed, s.moduleId] })),
  answerQuiz: (id, selected) => set(s => {
    const question = quiz.find(item => item.id === id);
    if (!question || id in s.quizAnswers || !Number.isInteger(selected) || selected < 0 || selected >= question.options.length) return {};
    return { quizAnswers: { ...s.quizAnswers, [id]: selected } };
  }),
  selectQuiz: activeQuiz => {
    if (quiz.some(item => item.id === activeQuiz)) set({ activeQuiz, studyTab: 'quiz', view: 'quiz', notice: '', sandboxJournal: null });
  },
  resetQuiz: () => set({ quizAnswers: {}, activeQuiz: 'case-01' }),
  nextCase: () => set(s => {
    const currentAction = caseActions[s.state.caseAction];
    const result = executeCaseAction(s.state);
    return result.ok ? { state: result.value, selectedStepId: currentAction?.id ?? null, sandboxJournal: null, notice: '' } : { notice: result.error };
  }),
  runCase: () => {
    let state = get().state;
    while (state.caseAction < caseActions.length) {
      const result = executeCaseAction(state);
      if (!result.ok) { set({ state, notice: result.error, sandboxJournal: null }); return; }
      state = result.value;
    }
    set({ state, selectedStepId: caseActions[caseActions.length - 1]?.id ?? null, sandboxJournal: null, notice: '' });
  },
  resetCase: () => set({ state: initialSapState(), selectedStepId: null, sandboxJournal: null, notice: '' }),
  setSandboxJournal: sandboxJournal => set({ sandboxJournal }),
  setAvacBudget: avacBudget => set({ avacBudget }),
  selectSession: index => set(s => {
    if (!Number.isInteger(index) || index < 0 || index >= s.sessions.length) return {};
    return { activeSession: index, notice: '', sandboxJournal: null, ...sessionNavigation(s.sessions[index]) };
  }),
  command: text => set(s => {
    const parsed = parseTCodeCommand(text);
    if (!parsed.ok) return { notice: parsed.error };
    const { mode, tcode } = parsed.value;
    if (mode === 'end' || mode === 'exit') {
      return { sessions: ['SAP Easy Access'], activeSession: 0, view: 'reader', studyTab: 'modules', sandboxJournal: null, notice: 'Semua sesi navigasi lab ditutup; data latihan tetap tersimpan selama halaman terbuka.' };
    }
    if (mode === 'close') {
      const remaining = s.sessions.filter((_, i) => i !== s.activeSession);
      const sessions = remaining.length ? remaining : ['SAP Easy Access'];
      const activeSession = Math.min(s.activeSession, sessions.length - 1);
      return { sessions, activeSession, sandboxJournal: null, notice: '', ...sessionNavigation(sessions[activeSession]) };
    }
    if (mode === 'menu') return { view: 'reader', studyTab: 'modules', notice: 'SAP Easy Access (lab).', sandboxJournal: null };
    const known = Boolean(route[tcode]) || dictionaries.some(d => d.category !== 'Tabel SE16N' && dictionaryCodes(d).includes(tcode));
    if (!known) return { notice: `${tcode}: kode tidak terdaftar pada lab atau kamus.` };
    if (mode === 'new' && s.sessions.length >= 6) return { notice: 'Maksimum enam sesi navigasi lab.' };
    const sessions = [...s.sessions];
    const activeSession = mode === 'new' ? sessions.length : s.activeSession;
    if (mode === 'new') sessions.push(tcode);
    else sessions[activeSession] = tcode;
    return { sessions, activeSession, sandboxJournal: null, ...sessionNavigation(tcode) };
  }),
}));
