import { dictionaryMetadata } from '../data/dictionary-metadata';

export interface Heading { id: string; depth: number; text: string; startLine: number; endLine: number }
export interface Module { id: string; title: string; fileName: string; rawMarkdown: string; headings: Heading[] }
export interface SearchHit { moduleId: string; headingId: string; title: string; excerpt: string }
export interface StudyIndexEntry { moduleId: string; headingId: string; title: string; text: string }
export interface DictionaryEntry {
  category: 'T-Code & Fiori' | 'SPRO IMG' | 'Tabel SE16N' | 'Troubleshooting Error';
  code: string;
  description: string;
  detail: string;
  explanation?: string;
  moduleId?: string;
  sources?: readonly { title: string; url: string }[];
}
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
  return modules.flatMap(module => {
    const lines = module.rawMarkdown.split(/\r?\n/);
    return module.headings.map(h => ({ moduleId: module.id, headingId: h.id, title: h.text, text: lines.slice(h.startLine - 1, h.endLine).join(' ') }));
  });
}

export function searchStudy(index: readonly StudyIndexEntry[], query: string, limit = 50): SearchHit[] {
  const terms = normalize(query).trim().split(' ').filter(Boolean);
  if (!terms.length || limit <= 0) return [];
  return index.map(item => ({ item, text: normalize(item.text) }))
    .filter(({ text }) => terms.every(term => text.includes(term)))
    .map(({ item, text }) => {
      const start = Math.max(0, text.indexOf(terms[0]) - 70);
      return { ...item, score: terms.reduce((n, term) => n + (normalize(item.title).includes(term) ? 10 : 0), 0), excerpt: item.text.slice(start, start + 210) };
    })
    .sort((a, b) => b.score - a.score).slice(0, limit);
}

const clean = (s: string) => s.replace(/<br\s*\/?\s*>/gi, ' · ').replace(/\$\\(?:rightarrow|to)\$/g, '→').replace(/[*`]/g, '').trim();
const dictionaryKey = (code: string) => {
  const normalized = clean(code).replace(/\s+/g, ' ');
  return /^([A-Z][A-Z0-9]\s+\d{3})(?=:|$)/.exec(normalized)?.[1] ?? normalized;
};
const metadataByKey = new Map(Object.entries(dictionaryMetadata).map(([code, metadata]) => [dictionaryKey(code), metadata]));

function attachMetadata(entry: DictionaryEntry): DictionaryEntry {
  const metadata = metadataByKey.get(dictionaryKey(entry.code));
  return metadata
    ? { ...entry, ...metadata }
    : { ...entry, explanation: `${entry.description}\n${entry.detail}` };
}

export function dictionaryCodes(entry: DictionaryEntry): string[] {
  return [...entry.code.matchAll(/\b[A-Z][A-Z0-9_]*(?:[-.][A-Z0-9_]+)*\b/g)]
    .map(match => match[0]).filter(code => !['ECC', 'SPRO', 'IMG'].includes(code));
}

export function buildDictionaries(modules: readonly Module[]): DictionaryEntry[] {
  const source = modules.find(m => m.id === '06');
  if (!source) return [];
  let section = 0;
  const result: DictionaryEntry[] = [];
  const seen = new Set<string>();
  const add = (entry: DictionaryEntry) => {
    const key = `${entry.category}:${entry.code}`;
    if (seen.has(key)) return;
    seen.add(key);
    result.push(attachMetadata(entry));
  };
  for (const line of source.rawMarkdown.split(/\r?\n/)) {
    const heading = /^## (\d+)\./.exec(line);
    if (heading) section = Number(heading[1]);
    if ([1, 2, 4].includes(section) && line.startsWith('|') && !/^\|\s*[:-]/.test(line)) {
      const cells = line.split('|').slice(1, -1).map(clean);
      if (section === 1 && cells.length === 4 && cells[1] !== 'T-Code GUI') {
        add({ category: 'T-Code & Fiori', code: cells[1], description: cells[2], detail: cells[3] });
      } else if (section === 2 && cells.length === 3 && cells[0] !== 'Area Konfigurasi') {
        add({ category: 'SPRO IMG', code: cells[1], description: cells[0], detail: cells[2] });
      } else if (section === 4 && cells.length === 5 && /^\d+$/.test(cells[0])) {
        add({ category: 'Troubleshooting Error', code: cells[1], description: cells[2], detail: `${cells[3]} — ${cells[4]}` });
      }
    }
    if (section === 3 && /^\s*- /.test(line)) {
      for (const match of line.matchAll(/`([A-Z][A-Z0-9_]{2,})`(?:\*\*)?\s*\(([^)]*)\)/g)) {
        add({ category: 'Tabel SE16N', code: match[1], description: clean(match[2]), detail: 'Referensi struktur SAP; proyeksi sintetis lab hanya tersedia untuk tabel terpilih.' });
      }
    }
  }
  return result;
}

const quizChoices: Record<string, { options: string[]; correct: number }> = {
  '1': { options: ['101 Q selalu langsung menjadi biaya.', 'Jalankan AFAB untuk mengakui biaya.', 'Pada valuated project stock, biaya muncul saat pemakaian; held Q di monitor ini adalah kebijakan lab.', 'Hapus WBS dari PO.'], correct: 2 },
  '2': { options: ['Hapus baris BSEG langsung.', 'Batalkan melalui proses asal: pembatalan goods movement atau MR8M sesuai dokumennya.', 'Batalkan hanya jurnal FI lewat FB08.', 'Jalankan F110.'], correct: 1 },
  '3': { options: ['Clearing WRX selalu memakai kurs faktur terbaru.', 'Semua selisih menjadi PPN.', 'Kurs tidak memengaruhi invoice.', 'Dengan asumsi kasus, clearing GR/IR mengikuti nilai historis GR dan selisih kurs diidentifikasi terpisah.'], correct: 3 },
  '4': { options: ['Periksa sisa pengiriman lalu tandai Delivery Completed bila benar-benar selesai; jangan menganggap ini melarang penerimaan tambahan.', 'Jalankan AFAB.', 'Buat PR kedua tanpa meninjau PO.', 'Tutup periode FI untuk membebaskan budget.'], correct: 0 },
  '5': { options: ['AuC selalu langsung disusutkan.', 'Untuk asumsi kasus, selesaikan kapitalisasi saat aset siap digunakan; penyusutan mengikuti tanggal mulai dan depreciation key.', 'Hapus dokumen CJ88.', 'Ubah budget agar AFAB bisa berjalan.'], correct: 1 },
};

export function buildQuiz(modules: readonly Module[]): Quiz[] {
  const raw = modules.find(m => m.id === '06')?.rawMarkdown ?? '';
  return [...raw.matchAll(/###\s+❓\s+Kasus\s+(\d+):\s*([^\n]+)\n([\s\S]*?)<details>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/g)]
    .map(m => ({ id: `case-${m[1].padStart(2, '0')}`, title: clean(m[2]), question: m[3].trim(), answer: m[4].trim(), options: quizChoices[m[1]]?.options ?? [], correct: quizChoices[m[1]]?.correct ?? -1 }));
}

export function evaluateQuiz(quiz: Quiz, selected: number): boolean {
  return Number.isInteger(selected) && selected >= 0 && selected < quiz.options.length && selected === quiz.correct;
}
