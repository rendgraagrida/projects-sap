import { useState } from 'react';
import { dictionaries, modules, quiz, studyIndex } from '../data/curriculum';
import { searchStudy } from '../lib/study-engine';
import { useSapStore } from '../store/use-sap-store';

export function LeftPanel() {
  const [tab, setTab] = useState<'modules' | 'dictionary' | 'quiz'>('modules');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('T-Code & Fiori');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const { moduleId, openModule, completed } = useSapStore();
  const hits = searchStudy(studyIndex, query, 30);
  return <aside className="panel left"><div className="panel-tabs">{(['modules', 'dictionary', 'quiz'] as const).map(t => <button className={tab === t ? 'active' : ''} key={t} onClick={() => setTab(t)}>{t === 'modules' ? 'Materi' : t === 'dictionary' ? 'Kamus' : 'Kuis'}</button>)}</div>
    {tab === 'modules' && <><h2>Perjalanan belajar</h2><input aria-label="Cari materi" placeholder="Cari seluruh materi..." value={query} onChange={e => setQuery(e.target.value)} />{query ? <div>{hits.map((hit, i) => <button className="module-link" key={i} onClick={() => { openModule(hit.moduleId); requestAnimationFrame(() => document.getElementById(hit.headingId)?.scrollIntoView()); }}><strong>{hit.title}</strong><small>Modul {hit.moduleId} · {hit.excerpt}</small></button>)}</div> : modules.map(m => <button key={m.id} className={`module-link ${moduleId === m.id ? 'selected' : ''}`} onClick={() => openModule(m.id)}><span className="module-number">{m.id}</span><span>{m.title}<small>{completed.includes(m.id) ? '✓ Selesai dibaca' : 'Buka modul'}</small></span></button>)}</>}
    {tab === 'dictionary' && <><h2>Kamus konsultan</h2><select value={category} onChange={e => setCategory(e.target.value)}>{['T-Code & Fiori', 'SPRO IMG', 'Tabel SE16N', 'Troubleshooting Error'].map(c => <option key={c}>{c}</option>)}</select><input placeholder="Filter kamus..." value={query} onChange={e => setQuery(e.target.value)} />{dictionaries.filter(d => d.category === category && `${d.code} ${d.description} ${d.detail}`.toLowerCase().includes(query.toLowerCase())).map((d, i) => <div className="dictionary-entry" key={i}><strong>{d.code}</strong><p>{d.description}</p><small>{d.detail}</small></div>)}</>}
    {tab === 'quiz' && <><h2>Ujian konsultan</h2><p>{Object.keys(answers).filter(id => answers[id] === 0).length} / {quiz.length} benar</p>{quiz.map(q => <details key={q.id}><summary>{q.title}</summary><p>{q.question}</p>{q.options.map((option, i) => <button className="quiz-option" key={option} disabled={q.id in answers} onClick={() => setAnswers(a => ({ ...a, [q.id]: i }))}>{option}</button>)}{q.id in answers && <div className="quiz-feedback"><strong>{answers[q.id] === q.correct ? 'Benar' : 'Belum tepat'}</strong><p>{q.answer.replace(/[*`]/g, '')}</p></div>}</details>)}<button onClick={() => setAnswers({})}>Ulangi kuis</button></>}
  </aside>;
}
