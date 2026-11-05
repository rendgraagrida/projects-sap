import { beforeEach, describe, expect, test } from 'bun:test';
import { useSapStore } from '../src/store/use-sap-store';
import { initialSapState, parseTCodeCommand } from '../src/lib/sap-engine';
import { dictionaries, quiz } from '../src/data/curriculum';
import { caseActions } from '../src/data/capex-case';
import type { Journal } from '../src/types/sap';

const initial = useSapStore.getInitialState();
beforeEach(() => useSapStore.setState({ ...initial, state: initialSapState(), sessions: ['SAP Easy Access'], quizAnswers: {}, completed: [] }, true));

describe('Command navigation lifecycle', () => {
  test('distinguishes a new session, current-session close, and all-session logoff', () => {
    const { command } = useSapStore.getState();
    expect(parseTCodeCommand('/i')).toEqual({ ok: true, value: { mode: 'close', tcode: '' } });
    command('/oMIGO');
    command('/oMIRO');
    expect(useSapStore.getState().view).toBe('miro');
    command('/i');
    expect(useSapStore.getState().sessions).toEqual(['SAP Easy Access', 'MIGO']);
    expect(useSapStore.getState().view).toBe('migo');
    command('/nex');
    expect(useSapStore.getState().sessions).toEqual(['SAP Easy Access']);
    expect(useSapStore.getState().view).toBe('reader');
  });

  test('does not create phantom sessions for unknown codes or exceed the session limit', () => {
    const { command } = useSapStore.getState();
    command('/oUNSUPPORTED999');
    expect(useSapStore.getState().sessions).toEqual(['SAP Easy Access']);
    for (const code of ['MIGO', 'MIRO', 'CJ30', 'CJ88', 'AFAB']) command(`/o${code}`);
    const before = useSapStore.getState();
    command('/oMIGO');
    expect(useSapStore.getState().sessions).toEqual(before.sessions);
    expect(useSapStore.getState().activeSession).toBe(before.activeSession);
  });

  test('routes references to their dictionary instead of leaving an unrelated simulator visible', () => {
    const { command, selectSession } = useSapStore.getState();
    command('/oMIGO');
    command('/oFS10N');
    expect(useSapStore.getState().view).toBe('dictionary');
    expect(useSapStore.getState().selectedDictionary?.code).toContain('FS10N');
    selectSession(1);
    expect(useSapStore.getState().view).toBe('migo');
    selectSession(2);
    expect(useSapStore.getState().view).toBe('dictionary');
    const selected = useSapStore.getState().activeSession;
    for (const index of [-1, 100, 0.5, NaN]) selectSession(index);
    expect(useSapStore.getState().activeSession).toBe(selected);
  });

  test('logoff does not erase completed exercise data', () => {
    useSapStore.getState().runCase();
    const state = useSapStore.getState().state;
    useSapStore.getState().command('/nend');
    expect(useSapStore.getState().state).toBe(state);
    expect(useSapStore.getState().sessions).toEqual(['SAP Easy Access']);
  });
});

describe('Learning state boundaries', () => {
  test('dictionary replaces the reader, and opening a module restores coherent navigation', () => {
    const store = useSapStore.getState();
    store.openModule('02');
    const state = useSapStore.getState().state;
    store.setSelectedDictionary(dictionaries[0]);
    expect(useSapStore.getState().view).toBe('dictionary');
    expect(useSapStore.getState().studyTab).toBe('dictionary');
    expect(useSapStore.getState().state).toBe(state);
    store.openModule('03', 'target-heading');
    expect(useSapStore.getState().view).toBe('reader');
    expect(useSapStore.getState().studyTab).toBe('modules');
    expect(useSapStore.getState().readerAnchor).toBe('target-heading');
    store.openModule('not-a-module');
    expect(useSapStore.getState().moduleId).toBe('03');
  });

  test('completion is idempotent and quiz answers cannot be replaced to inflate a score', () => {
    const store = useSapStore.getState();
    store.openModule('02');
    store.markComplete();
    store.markComplete();
    expect(useSapStore.getState().completed).toEqual(['02']);
    const question = quiz[0];
    const wrong = (question.correct + 1) % question.options.length;
    store.answerQuiz(question.id, wrong);
    store.setStudyTab('modules');
    store.selectQuiz(question.id);
    store.answerQuiz(question.id, question.correct);
    expect(useSapStore.getState().quizAnswers[question.id]).toBe(wrong);
    store.resetQuiz();
    store.answerQuiz(question.id, question.correct);
    expect(useSapStore.getState().quizAnswers[question.id]).toBe(question.correct);
    const answers = useSapStore.getState().quizAnswers;
    for (const selected of [-1, 4, NaN]) store.answerQuiz(quiz[1].id, selected);
    store.answerQuiz('unknown', 0);
    expect(useSapStore.getState().quizAnswers).toBe(answers);
  });
});

describe('CAPEX and sandbox isolation', () => {
  test('preview and AVAC changes do not corrupt the sequential case; reset removes its prior documents', () => {
    const store = useSapStore.getState();
    store.runCase();
    const state = useSapStore.getState().state;
    expect(state.caseAction).toBe(caseActions.length);
    const journal: Journal = { id: 'SANDBOX', tcode: 'MIGO', type: 'WE', lines: [], description: 'No FI posting' };
    store.setSandboxJournal(journal);
    store.setAvacBudget({ ...store.avacBudget, pr: 10000n });
    expect(useSapStore.getState().state).toBe(state);
    store.runCase();
    expect(useSapStore.getState().state.journals).toEqual(state.journals);
    store.resetCase();
    expect(useSapStore.getState().state.journals).toEqual([]);
    expect(useSapStore.getState().sandboxJournal).toBeNull();
    expect(useSapStore.getState().avacBudget.pr).toBe(10000n);
    store.runCase();
    expect(useSapStore.getState().state.assets).toEqual(state.assets);
  });
});
