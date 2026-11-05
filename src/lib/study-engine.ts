export interface Heading { id: string; depth: number; text: string; startLine: number; endLine: number }
export interface Module { id: string; title: string; fileName: string; rawMarkdown: string; headings: Heading[] }
export interface SearchHit { moduleId: string; headingId: string; title: string; excerpt: string }
export interface StudyIndexEntry { moduleId: string; headingId: string; title: string; text: string }
export interface DictionaryEntry { category: 'T-Code & Fiori' | 'SPRO IMG' | 'Tabel SE16N' | 'Troubleshooting Error'; code: string; description: string; detail: string }
export interface Quiz { id: string; title: string; question: string; answer: string; options: string[]; correct: number }

export function slugHeading(text: string): string {
  return text.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
}
export function parseCurriculum(id: string, fileName: string, rawMarkdown: string): Module {
  const lines = rawMarkdown.split(/\r?\n/);
  const headings: Heading[] = [];
  const counts = new Map<string, number>();
  let fenced = false;
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) { fenced = !fenced; return; }
    const match = !fenced && /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) return;
    const text = match[2].replace(/[`*_]/g, '');
    const base = slugHeading(text) || 'section';
    const count = (counts.get(base) ?? 0) + 1;
    counts.set(base, count);
    headings.push({ id: count === 1 ? base : `${base}-${count}`, depth: match[1].length, text, startLine: i + 1, endLine: lines.length });
  });
  headings.forEach((heading, i) => { heading.endLine = (headings[i + 1]?.startLine ?? lines.length + 1) - 1; });
  return { id, fileName, rawMarkdown, title: headings[0]?.text ?? fileName, headings };
}
const normalize = (text: string) => text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/\b(bp)\s+(604)\b/g, '$1$2').replace(/\s+/g, ' ');
export function buildStudyIndex(modules: readonly Module[]): StudyIndexEntry[] {
  return modules.flatMap(module => module.headings.map(h => ({ moduleId: module.id, headingId: h.id, title: h.text, text: module.rawMarkdown.split(/\r?\n/).slice(h.startLine - 1, h.endLine).join(' ') })));
}
export function searchStudy(index: readonly StudyIndexEntry[], query: string, limit = 50): SearchHit[] {
  const terms = normalize(query).trim().split(' ').filter(Boolean);
  if (!terms.length) return [];
  return index.map(item => ({ item, text: normalize(item.text) })).filter(({ text }) => terms.every(term => text.includes(term))).map(({ item, text }) => ({ ...item, score: terms.reduce((n, term) => n + (normalize(item.title).includes(term) ? 10 : 0), 0), excerpt: item.text.slice(Math.max(0, text.indexOf(terms[0]) - 70), Math.max(0, text.indexOf(terms[0]) - 70) + 210) })).sort((a, b) => b.score - a.score).slice(0, limit);
}
const clean = (s: string) => s.replace(/<br\s*\/?\s*>/gi, ' · ').replace(/[*`]/g, '').trim();
export function buildDictionaries(modules: readonly Module[]): DictionaryEntry[] {
  const source = modules.find(m => m.id === '06');
  if (!source) return [];
  let section = 0;
  const result: DictionaryEntry[] = [];
  for (const line of source.rawMarkdown.split(/\r?\n/)) {
    const heading = /^## (\d)\./.exec(line);
    if (heading) section = Number(heading[1]);
    if ((section === 1 || section === 2 || section === 4) && line.startsWith('|') && !/^\|\s*[:-]/.test(line)) {
      const cells = line.split('|').slice(1, -1).map(clean);
      if (section === 1 && cells.length === 4 && cells[1] !== 'T-Code GUI') {
        const codes = [...cells[1].matchAll(/\b(?:[A-Z][A-Z0-9_]*[-.]?[A-Z0-9]+)\b/g)].map(m => m[0]).filter(c => c !== 'ECC');
        for (const code of codes) result.push({ category: 'T-Code & Fiori', code, description: cells[2], detail: cells[3] });
      } else if (section === 2 && cells.length === 3 && cells[0] !== 'Area Konfigurasi') {
        result.push({ category: 'SPRO IMG', code: cells[1], description: cells[0], detail: cells[2] });
      } else if (section === 4 && cells.length === 5 && /^\d+$/.test(cells[0])) {
        result.push({ category: 'Troubleshooting Error', code: cells[1], description: cells[2], detail: `${cells[3]} — ${cells[4]}` });
      }
    }
    if (section === 3 && /^\s*- /.test(line)) {
      for (const match of line.matchAll(/`([A-Z][A-Z0-9]{2,})`\s*\(([^)]*)\)/g)) result.push({ category: 'Tabel SE16N', code: match[1], description: clean(match[2]), detail: 'Referensi materi; proyeksi live bergantung pada simulator.' });
    }
  }
  return result;
}
const options = [
  ['Stok Q belum menjadi biaya; lakukan 221 Q saat digunakan.', '101 Q langsung menjadi biaya proyek.', 'Jalankan AFAB untuk mengakui biaya.', 'Hapus WBS dari PO.'],
  ['Batalkan dokumen logistik dari MIGO atau MR8M.', 'Batalkan hanya jurnal FI dengan FB08.', 'Hapus baris BSEG langsung.', 'Jalankan F110.'],
  ['Debit WRX pada kurs GR dan selisih kurs ke KDM.', 'Debit WRX pada kurs faktur tanpa selisih.', 'Catat semua selisih sebagai PPN.', 'Tidak perlu jurnal MIRO.'],
  ['Tandai Delivery Completed (ELIKZ) pada PO.', 'Jalankan AFAB.', 'Buat PR kedua.', 'Tutup periode FI.'],
  ['AuC belum disusutkan; lakukan full settlement ke aset final.', 'AuC selalu langsung disusutkan.', 'Hapus dokumen CJ88.', 'Buka kembali periode MM.'],
];
export function buildQuiz(modules: readonly Module[]): Quiz[] {
  const raw = modules.find(m => m.id === '06')?.rawMarkdown ?? '';
  return [...raw.matchAll(/###\s+❓\s+Kasus\s+(\d+):\s*([^\n]+)\n([\s\S]*?)<details>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/g)].map((m, i) => ({ id: `case-0${m[1]}`, title: clean(m[2]), question: clean(m[3]), answer: m[4].trim(), options: options[i] ?? [], correct: 0 }));
}
export function evaluateQuiz(quiz: Quiz, selected: number): boolean { return selected === quiz.correct; }
