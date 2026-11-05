import { beforeEach, describe, expect, test } from 'bun:test';
import { useSapStore } from '../src/store/use-sap-store';
import { initialSapState, parseTCodeCommand } from '../src/lib/sap-engine';
import { caseActions } from '../src/data/capex-case';
import type { Journal } from '../src/types/sap';

describe('SAP Command Field Parser (parseTCodeCommand)', () => {
  test('parses bare T-Codes into replace mode and normalizes uppercase', () => {
    expect(parseTCodeCommand('ME21N')).toEqual({ ok: true, value: { mode: 'replace', tcode: 'ME21N' } });
    expect(parseTCodeCommand('migo')).toEqual({ ok: true, value: { mode: 'replace', tcode: 'MIGO' } });
    expect(parseTCodeCommand('  cj20n  ')).toEqual({ ok: true, value: { mode: 'replace', tcode: 'CJ20N' } });
    expect(parseTCodeCommand('F-48')).toEqual({ ok: true, value: { mode: 'replace', tcode: 'F-48' } });
  });

  test('parses /n prefix into replace mode', () => {
    expect(parseTCodeCommand('/nME21N')).toEqual({ ok: true, value: { mode: 'replace', tcode: 'ME21N' } });
    expect(parseTCodeCommand('/nmiro')).toEqual({ ok: true, value: { mode: 'replace', tcode: 'MIRO' } });
    expect(parseTCodeCommand('  /NFS10N  ')).toEqual({ ok: true, value: { mode: 'replace', tcode: 'FS10N' } });
  });

  test('parses /o prefix into new session mode', () => {
    expect(parseTCodeCommand('/oMIGO')).toEqual({ ok: true, value: { mode: 'new', tcode: 'MIGO' } });
    expect(parseTCodeCommand('/ocj30')).toEqual({ ok: true, value: { mode: 'new', tcode: 'CJ30' } });
    expect(parseTCodeCommand('  /OAFAB  ')).toEqual({ ok: true, value: { mode: 'new', tcode: 'AFAB' } });
  });

  test('parses system navigation and exit commands (/n, /nend, /nex)', () => {
    expect(parseTCodeCommand('/n')).toEqual({ ok: true, value: { mode: 'menu', tcode: '' } });
    expect(parseTCodeCommand('/N')).toEqual({ ok: true, value: { mode: 'menu', tcode: '' } });
    expect(parseTCodeCommand('/nend')).toEqual({ ok: true, value: { mode: 'end', tcode: '' } });
    expect(parseTCodeCommand('/NEND')).toEqual({ ok: true, value: { mode: 'end', tcode: '' } });
    expect(parseTCodeCommand('/nex')).toEqual({ ok: true, value: { mode: 'exit', tcode: '' } });
    expect(parseTCodeCommand('/NEX')).toEqual({ ok: true, value: { mode: 'exit', tcode: '' } });
  });

  test('rejects malformed commands and invalid prefixes', () => {
    expect(parseTCodeCommand('')).toEqual({ ok: false, error: 'Perintah SAP tidak valid.' });
    expect(parseTCodeCommand('   ')).toEqual({ ok: false, error: 'Perintah SAP tidak valid.' });
    expect(parseTCodeCommand('//ME21N')).toEqual({ ok: false, error: 'Perintah SAP tidak valid.' });
    expect(parseTCodeCommand('/xME21N')).toEqual({ ok: false, error: 'Perintah SAP tidak valid.' });
    expect(parseTCodeCommand('!CMD')).toEqual({ ok: false, error: 'Perintah SAP tidak valid.' });
  });
});

describe('Zustand Store Integration & Session Management', () => {
  beforeEach(() => {
    useSapStore.setState({
      edition: 'S4',
      view: 'reader',
      moduleId: '01',
      completed: [],
      state: initialSapState(),
      sandboxJournal: null,
      sessions: ['SAP Easy Access'],
      activeSession: 0,
      notice: '',
    });
  });

  test('initial state conforms to contract', () => {
    const s = useSapStore.getState();
    expect(s.edition).toBe('S4');
    expect(s.view).toBe('reader');
    expect(s.moduleId).toBe('01');
    expect(s.completed).toEqual([]);
    expect(s.sessions).toEqual(['SAP Easy Access']);
    expect(s.activeSession).toBe(0);
    expect(s.sandboxJournal).toBeNull();
  });

  test('opens new sessions via /o up to 6 session cap and enforces limit', () => {
    const { command } = useSapStore.getState();

    command('/oME21N');
    expect(useSapStore.getState().sessions).toEqual(['SAP Easy Access', 'ME21N']);
    expect(useSapStore.getState().activeSession).toBe(1);
    expect(useSapStore.getState().view).toBe('case');

    command('/oMIGO');
    command('/oMIRO');
    command('/oCJ30');
    command('/oCJ88');
    expect(useSapStore.getState().sessions.length).toBe(6);
    expect(useSapStore.getState().sessions).toEqual(['SAP Easy Access', 'ME21N', 'MIGO', 'MIRO', 'CJ30', 'CJ88']);
    expect(useSapStore.getState().activeSession).toBe(5);

    // 7th session attempt is blocked
    command('/oAFAB');
    expect(useSapStore.getState().sessions.length).toBe(6);
    expect(useSapStore.getState().notice).toBe('Maksimum enam sesi simulasi.');
  });

  test('replaces active session via /n or bare T-Code and routes view', () => {
    const { command } = useSapStore.getState();

    // Replace default session with MIGO
    command('MIGO');
    expect(useSapStore.getState().sessions).toEqual(['MIGO']);
    expect(useSapStore.getState().view).toBe('migo');

    // Replace with MIRO via /nMIRO
    command('/nMIRO');
    expect(useSapStore.getState().sessions).toEqual(['MIRO']);
    expect(useSapStore.getState().view).toBe('miro');

    // Replace with AVAC via /nCJ30
    command('/nCJ30');
    expect(useSapStore.getState().sessions).toEqual(['CJ30']);
    expect(useSapStore.getState().view).toBe('avac');

    // Replace with Settlement via /nCJ88
    command('/nCJ88');
    expect(useSapStore.getState().sessions).toEqual(['CJ88']);
    expect(useSapStore.getState().view).toBe('settlement');
  });

  test('handles reference-only unmapped T-Codes without changing view', () => {
    const { command, setView } = useSapStore.getState();
    setView('case');

    command('FS10N');
    expect(useSapStore.getState().view).toBe('case'); // View remains unchanged
    expect(useSapStore.getState().notice).toContain('FS10N: referensi saja, tidak ada transaksi interaktif.');
  });

  test('navigates to menu with /n and closes sessions with /nend and /nex', () => {
    const { command } = useSapStore.getState();

    command('/oMIGO');
    command('/oMIRO');
    expect(useSapStore.getState().sessions.length).toBe(3);
    expect(useSapStore.getState().activeSession).toBe(2);

    // Close active session (MIRO) via /nend
    command('/nend');
    expect(useSapStore.getState().sessions).toEqual(['SAP Easy Access', 'MIGO']);
    expect(useSapStore.getState().activeSession).toBe(0);
    expect(useSapStore.getState().notice).toBe('Sesi simulasi ditutup.');

    // Close remaining session via /nex
    command('/nex');
    expect(useSapStore.getState().sessions).toEqual(['MIGO']);

    command('/nex');
    // Closing last session resets to SAP Easy Access
    expect(useSapStore.getState().sessions).toEqual(['SAP Easy Access']);
  });

  test('selectSession switches active session and updates view', () => {
    const { command, selectSession } = useSapStore.getState();

    command('/oMIGO');
    command('/oMIRO');

    selectSession(1);
    expect(useSapStore.getState().activeSession).toBe(1);
    expect(useSapStore.getState().view).toBe('migo');

    selectSession(2);
    expect(useSapStore.getState().activeSession).toBe(2);
    expect(useSapStore.getState().view).toBe('miro');

    // Out of bounds selection does nothing
    selectSession(-1);
    expect(useSapStore.getState().activeSession).toBe(2);
    selectSession(10);
    expect(useSapStore.getState().activeSession).toBe(2);
  });
});

describe('Zustand Store Navigation, Modules, and Editions', () => {
  beforeEach(() => {
    useSapStore.setState({
      edition: 'S4',
      view: 'reader',
      moduleId: '01',
      completed: [],
      state: initialSapState(),
      sandboxJournal: null,
      sessions: ['SAP Easy Access'],
      activeSession: 0,
      notice: '',
    });
  });

  test('switches editions between S4 and ECC', () => {
    const { setEdition } = useSapStore.getState();
    setEdition('ECC');
    expect(useSapStore.getState().edition).toBe('ECC');
    setEdition('S4');
    expect(useSapStore.getState().edition).toBe('S4');
  });

  test('openModule sets module id and switches view to reader', () => {
    const { openModule, setView } = useSapStore.getState();
    setView('settlement');
    openModule('04');
    expect(useSapStore.getState().moduleId).toBe('04');
    expect(useSapStore.getState().view).toBe('reader');
  });

  test('markComplete records completion without duplicates', () => {
    const { markComplete, openModule } = useSapStore.getState();
    markComplete();
    expect(useSapStore.getState().completed).toEqual(['01']);
    markComplete();
    expect(useSapStore.getState().completed).toEqual(['01']); // No duplicate

    openModule('02');
    markComplete();
    expect(useSapStore.getState().completed).toEqual(['01', '02']);
  });
});

describe('Zustand Store Case Study Lifecycle & Sandbox Isolation', () => {
  beforeEach(() => {
    useSapStore.setState({
      edition: 'S4',
      view: 'reader',
      moduleId: '01',
      completed: [],
      state: initialSapState(),
      sandboxJournal: null,
      sessions: ['SAP Easy Access'],
      activeSession: 0,
      notice: '',
    });
  });

  test('nextCase steps through actions one by one and clears sandbox journal', () => {
    const dummyJournal: Journal = { id: 'TEST', tcode: 'MIGO', type: 'WE', lines: [], description: 'Test' };
    useSapStore.getState().setSandboxJournal(dummyJournal);
    expect(useSapStore.getState().sandboxJournal).toBe(dummyJournal);

    useSapStore.getState().nextCase();
    expect(useSapStore.getState().state.caseAction).toBe(1);
    expect(useSapStore.getState().sandboxJournal).toBeNull();
  });

  test('runCase completes all 17 sub-actions to completion', () => {
    useSapStore.getState().runCase();
    const finalState = useSapStore.getState().state;
    expect(finalState.caseAction).toBe(caseActions.length);
    expect(finalState.caseStatus).toBe('TECO');
    expect(useSapStore.getState().sandboxJournal).toBeNull();

    // Calling nextCase on finished case sets notice
    useSapStore.getState().nextCase();
    expect(useSapStore.getState().notice).toBe('Seluruh langkah telah selesai.');
  });

  test('resetCase restores initial SAP state and clears sandbox and notice', () => {
    useSapStore.getState().runCase();
    useSapStore.getState().resetCase();

    const resetState = useSapStore.getState().state;
    expect(resetState.caseAction).toBe(0);
    expect(resetState.budgets[0].released).toBe(0n);
    expect(resetState.journals.length).toBe(0);
    expect(useSapStore.getState().notice).toBe('');
    expect(useSapStore.getState().sandboxJournal).toBeNull();
  });

  test('sandbox simulations do not corrupt case study state', () => {
    const dummyJournal: Journal = { id: 'SANDBOX', tcode: 'MIRO', type: 'RE', lines: [], description: 'Sandbox' };
    useSapStore.getState().setSandboxJournal(dummyJournal);

    const initial = useSapStore.getState().state;
    expect(initial.caseAction).toBe(0);
    expect(initial.budgets[0].released).toBe(0n);
    expect(useSapStore.getState().sandboxJournal).toBe(dummyJournal);
  });
});
