import { useState } from 'react';
import { dictionaries, modules, quiz, studyIndex } from '../data/curriculum';
import { evaluateQuiz, searchStudy, type DictionaryEntry } from '../lib/study-engine';
import { useSapStore, type StudyTab } from '../store/use-sap-store';

const categories: DictionaryEntry['category'][] = ['T-Code & Fiori', 'SPRO IMG', 'Tabel SE16N', 'Troubleshooting Error'];

export function LeftPanel() {
  const [moduleQuery, setModuleQuery] = useState('');
  const [dictionaryQuery, setDictionaryQuery] = useState('');
  const [category, setCategory] = useState<DictionaryEntry['category']>('T-Code & Fiori');
  const store = useSapStore();
  const hits = searchStudy(studyIndex, moduleQuery, 30);
  const visibleEntries = dictionaries.filter(d => d.category === category && `${d.code} ${d.description} ${d.detail}`.toLowerCase().includes(dictionaryQuery.toLowerCase().trim()));
  const score = quiz.filter(q => evaluateQuiz(q, store.quizAnswers[q.id])).length;
  const selectStudyTab = (tab: StudyTab) => {
    store.setStudyTab(tab);
    if (tab === 'dictionary' && !visibleEntries.some(d => d.code === store.selectedDictionary?.code && d.category === store.selectedDictionary.category)) {
      store.setSelectedDictionary(visibleEntries[0] ?? null);
    }
  };
  const filterDictionary = (query: string, nextCategory: DictionaryEntry['category']) => {
    setDictionaryQuery(query);
    setCategory(nextCategory);
    const matches = dictionaries.filter(d => d.category === nextCategory && `${d.code} ${d.description} ${d.detail}`.toLowerCase().includes(query.toLowerCase().trim()));
    if (!matches.some(d => d.code === store.selectedDictionary?.code && d.category === store.selectedDictionary.category)) {
      store.setSelectedDictionary(matches[0] ?? null);
    }
  };

  return <aside className="panel left" aria-label="Navigasi dan sumber pembelajaran">
    <nav className="panel-tabs" aria-label="Bagian pembelajaran">
      {(['modules', 'dictionary', 'quiz'] as const).map(tab => <button type="button" aria-pressed={store.studyTab === tab && ['reader', 'dictionary', 'quiz'].includes(store.view)} className={store.studyTab === tab ? 'active' : ''} key={tab} onClick={() => selectStudyTab(tab)}>
        {tab === 'modules' ? 'Materi' : tab === 'dictionary' ? 'Kamus' : 'Kuis'}
      </button>)}
    </nav>
    {store.studyTab === 'modules' && <>
      <h2>Perjalanan belajar</h2>
      <input aria-label="Cari materi" placeholder="Cari seluruh materi..." value={moduleQuery} onChange={e => setModuleQuery(e.target.value)} />
      {moduleQuery.trim() ? <div>
        {!hits.length && <p role="status">Tidak ada materi yang cocok.</p>}
        {hits.map(hit => <button type="button" className="module-link" key={`${hit.moduleId}:${hit.headingId}`} onClick={() => store.openModule(hit.moduleId, hit.headingId)}>
          <strong>{hit.title}</strong><small>Modul {hit.moduleId} · {hit.excerpt}</small>
        </button>)}
      </div> : modules.map(module => <button type="button" key={module.id} aria-current={store.moduleId === module.id && store.view === 'reader' ? 'page' : undefined} className={`module-link ${store.moduleId === module.id ? 'selected' : ''}`} onClick={() => store.openModule(module.id)}>
        <span className="module-number">{module.id}</span><span>{module.title}<small>{store.completed.includes(module.id) ? 'Selesai dibaca' : 'Buka modul'}</small></span>
      </button>)}
    </>}
    {store.studyTab === 'dictionary' && <>
      <h2>Kamus konsultan</h2>
      <label htmlFor="dictionary-category">Kategori kamus</label>
      <select id="dictionary-category" value={category} onChange={e => filterDictionary(dictionaryQuery, e.target.value as DictionaryEntry['category'])}>
        {categories.map(item => <option key={item}>{item}</option>)}
      </select>
      <input aria-label="Filter kamus" placeholder="Filter kamus..." value={dictionaryQuery} onChange={e => filterDictionary(e.target.value, category)} />
      {!visibleEntries.length && <p role="status">Tidak ada entri kamus yang cocok.</p>}
      {visibleEntries.map(entry => <button type="button" className={`dictionary-entry ${store.selectedDictionary?.code === entry.code && store.selectedDictionary.category === entry.category ? 'selected' : ''}`} aria-pressed={store.view === 'dictionary' && store.selectedDictionary?.code === entry.code && store.selectedDictionary.category === entry.category} key={`${entry.category}:${entry.code}`} onClick={() => store.setSelectedDictionary(entry)}>
        <strong>{entry.code}</strong><span>{entry.description}</span><small>{entry.detail}</small>
      </button>)}
    </>}
    {store.studyTab === 'quiz' && <>
      <h2>Latihan pemahaman</h2>
      <p aria-live="polite">{score} / {quiz.length} benar · {Object.keys(store.quizAnswers).length} dijawab</p>
      {quiz.map(question => <button type="button" key={question.id} className={`module-link ${store.activeQuiz === question.id ? 'selected' : ''}`} aria-current={store.activeQuiz === question.id && store.view === 'quiz' ? 'page' : undefined} onClick={() => store.selectQuiz(question.id)}>
        <span>{question.title}<small>{question.id in store.quizAnswers ? evaluateQuiz(question, store.quizAnswers[question.id]) ? 'Benar' : 'Perlu dipelajari kembali' : 'Belum dijawab'}</small></span>
      </button>)}
    </>}
  </aside>;
}
