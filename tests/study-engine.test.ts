import { describe, expect, test } from 'bun:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  buildDictionaries,
  evaluateQuiz,
  parseCurriculum,
  searchStudy,
  slugHeading,
} from '../src/lib/study-engine';
import { dictionaries, modules, quiz, studyIndex } from '../src/data/curriculum';
import { MarkdownReader } from '../src/components/MarkdownReader';

describe('Curriculum & Study Engine - Markdown Parsing and Modules', () => {
  test('loads all six real curriculum modules with valid metadata', () => {
    expect(modules.length).toBe(6);
    const expectedIds = ['01', '02', '03', '04', '05', '06'];
    expect(modules.map(m => m.id)).toEqual(expectedIds);

    for (const mod of modules) {
      expect(mod.fileName.endsWith('.md')).toBe(true);
      expect(mod.title.length).toBeGreaterThan(0);
      expect(mod.rawMarkdown.length).toBeGreaterThan(100);
      expect(mod.headings.length).toBeGreaterThan(0);

      // Verify line coverage and heading continuity
      for (let i = 0; i < mod.headings.length; i++) {
        const heading = mod.headings[i];
        expect(heading.id.length).toBeGreaterThan(0);
        expect(heading.depth).toBeGreaterThanOrEqual(1);
        expect(heading.depth).toBeLessThanOrEqual(6);
        expect(heading.text.length).toBeGreaterThan(0);
        expect(heading.startLine).toBeLessThanOrEqual(heading.endLine);

        if (i < mod.headings.length - 1) {
          expect(heading.endLine).toBe(mod.headings[i + 1].startLine - 1);
        }
      }
    }
  });

  test('slugHeading normalizes casing, diacritics, punctuation, and trims dashes', () => {
    expect(slugHeading('Modul 01: Enterprise Structure & Master Data')).toBe('modul-01-enterprise-structure-master-data');
    expect(slugHeading('  OBYC -- Account Determination (MM-FI)  ')).toBe('obyc-account-determination-mm-fi');
    expect(slugHeading('BP 604: Budget Exceeded!')).toBe('bp-604-budget-exceeded');
    expect(slugHeading('### Special @#$% Characters')).toBe('special-characters');
    expect(slugHeading('')).toBe('');
    expect(slugHeading('---')).toBe('');
  });

  test('parseCurriculum disambiguates duplicate headings and ignores code fences', () => {
    const raw = [
      '# Modul Uji',
      '',
      '## Ringkasan Konsep',
      'Konten pertama.',
      '',
      '```markdown',
      '# Heading Dalam Code Fence',
      '## Subheading Palsu',
      '```',
      '',
      '## Ringkasan Konsep',
      'Konten kedua dengan judul sama.',
      '',
      '## Ringkasan Konsep',
      'Konten ketiga dengan judul sama.',
    ].join('\n');

    const parsed = parseCurriculum('test', 'test.md', raw);
    expect(parsed.headings.length).toBe(4);
    expect(parsed.headings.map(h => h.id)).toEqual([
      'modul-uji',
      'ringkasan-konsep',
      'ringkasan-konsep-2',
      'ringkasan-konsep-3',
    ]);
    expect(parsed.headings.find(h => h.text.includes('Code Fence'))).toBeUndefined();
  });
});

describe('Curriculum & Study Engine - Search & Indexing', () => {
  test('buildStudyIndex covers all module headings', () => {
    const totalHeadings = modules.reduce((sum, m) => sum + m.headings.length, 0);
    expect(studyIndex.length).toBe(totalHeadings);
    expect(studyIndex.length).toBeGreaterThan(50);
  });

  test('searches core SAP concepts across modules', () => {
    const searchTerms = [
      'OBYC',
      'BP 604',
      'ACDOCA',
      'CJ88',
      'Price Control',
      'GBB-VBR',
      'MATDOC',
      'BSX',
      'WRX',
      'MIGO',
      'MIRO',
    ];

    for (const term of searchTerms) {
      const results = searchStudy(studyIndex, term);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].excerpt.length).toBeGreaterThan(0);
    }
  });

  test('normalizes spaces and casing, and handles BP 604 synonym', () => {
    const hitsSpaced = searchStudy(studyIndex, '  bp   604  ');
    const hitsNormalized = searchStudy(studyIndex, 'bp604');
    const hitsUpper = searchStudy(studyIndex, 'BP 604');

    expect(hitsSpaced.length).toBeGreaterThan(0);
    expect(hitsSpaced.length).toBe(hitsNormalized.length);
    expect(hitsSpaced.length).toBe(hitsUpper.length);
    expect(hitsSpaced[0].headingId).toBe(hitsNormalized[0].headingId);
  });

  test('ranks title matches higher than body-only matches', () => {
    const results = searchStudy(studyIndex, 'OBYC');
    expect(results.length).toBeGreaterThan(1);
    expect(results[0].title.toUpperCase()).toContain('OBYC');
  });

  test('respects limit parameter and returns empty for empty or unmatchable queries', () => {
    const limited = searchStudy(studyIndex, 'OBYC', 3);
    expect(limited.length).toBe(3);

    expect(searchStudy(studyIndex, '')).toEqual([]);
    expect(searchStudy(studyIndex, '   ')).toEqual([]);
    expect(searchStudy(studyIndex, 'random_nonexistent_sap_tcode_xyz123')).toEqual([]);
  });
});

describe('Curriculum & Study Engine - Dictionary & References', () => {
  test('extracts comprehensive dictionary covering all 4 categories', () => {
    expect(dictionaries.length).toBeGreaterThan(100);

    const categories = new Set(dictionaries.map(d => d.category));
    expect(categories.has('T-Code & Fiori')).toBe(true);
    expect(categories.has('SPRO IMG')).toBe(true);
    expect(categories.has('Tabel SE16N')).toBe(true);
    expect(categories.has('Troubleshooting Error')).toBe(true);
  });

  test('includes essential T-Codes and Fiori app references', () => {
    const tcodes = dictionaries.filter(d => d.category === 'T-Code & Fiori').map(d => d.code);
    expect(tcodes).toContain('ME21N');
    expect(tcodes).toContain('ME22N');
    expect(tcodes).toContain('MIGO');
    expect(tcodes).toContain('MIRO');
    expect(tcodes).toContain('CJ20N');
    expect(tcodes).toContain('CJ88');
    expect(tcodes).toContain('AFAB');
    expect(tcodes).toContain('FS10N');
    expect(tcodes).toContain('FB08');

    const poEntry = dictionaries.find(d => d.code === 'ME21N');
    expect(poEntry?.detail).toContain('F0842A');
  });

  test('includes key SPRO configuration paths', () => {
    const spro = dictionaries.filter(d => d.category === 'SPRO IMG');
    expect(spro.length).toBeGreaterThanOrEqual(10);
    const codes = spro.map(s => s.code);
    expect(codes.some(c => c.includes('OX02'))).toBe(true);
    expect(codes.some(c => c.includes('OBYC'))).toBe(true);
  });

  test('includes essential database tables for S/4HANA and ECC', () => {
    const tables = dictionaries.filter(d => d.category === 'Tabel SE16N').map(t => t.code);
    expect(tables).toContain('MATDOC');
    expect(tables).toContain('BKPF');
    expect(tables).toContain('EKKO');
    expect(tables).toContain('EKPO');
    expect(tables).toContain('EKKN');
    expect(tables).toContain('PRPS');
    expect(tables).toContain('BPGE');
    expect(tables).toContain('COOI');
    expect(tables).toContain('ANLA');
    expect(tables).toContain('ANLC');
    expect(tables).toContain('MSPR');
    expect(tables).toContain('MARD');
  });

  test('includes critical troubleshooting error codes', () => {
    const errors = dictionaries.filter(d => d.category === 'Troubleshooting Error').map(e => e.code);
    expect(errors.some(e => e.startsWith('BP 604'))).toBe(true);
    expect(errors.some(e => e.startsWith('M8 534'))).toBe(true);
    expect(errors.some(e => e.startsWith('KI 235'))).toBe(true);
    expect(errors.some(e => e.startsWith('KD 503'))).toBe(true);

    const bp604 = dictionaries.find(d => d.code.startsWith('BP 604'));
    expect(bp604?.detail.toLowerCase()).toContain('budget');
  });

  test('returns empty dictionary if module 06 is omitted', () => {
    const without06 = modules.filter(m => m.id !== '06');
    expect(buildDictionaries(without06)).toEqual([]);
  });
});

describe('Curriculum & Study Engine - Quiz Evaluation', () => {
  test('extracts exactly 5 certification case studies from Module 06', () => {
    expect(quiz.length).toBe(5);
    expect(quiz.map(q => q.id)).toEqual(['case-01', 'case-02', 'case-03', 'case-04', 'case-05']);

    for (const q of quiz) {
      expect(q.title.length).toBeGreaterThan(0);
      expect(q.question.length).toBeGreaterThan(0);
      expect(q.answer.length).toBeGreaterThan(0);
      expect(q.options.length).toBe(4);
      expect(q.correct).toBe(0);
    }
  });

  test('verifies case study topics and answers', () => {
    // Case 1: Project Stock Q vs P
    expect(quiz[0].title).toContain('P vs Q');
    expect(quiz[0].options[0]).toContain('221 Q');

    // Case 2: Document Cancellation MIGO / MIRO
    expect(quiz[1].title).toContain('Membatalkan Dokumen');
    expect(quiz[1].options[0]).toContain('MIGO atau MR8M');

    // Case 3: FX Difference and Price Variance on MIRO
    expect(quiz[2].title).toContain('Selisih Kurs');
    expect(quiz[2].options[0]).toContain('KDM');

    // Case 4: Sisa Commitment PO Mengunci Budget
    expect(quiz[3].title).toContain('Sisa Commitment');
    expect(quiz[3].options[0]).toContain('Delivery Completed');

    // Case 5: AuC Depreciation in AFAB
    expect(quiz[4].title).toContain('AFAB');
    expect(quiz[4].options[0]).toContain('AuC belum disusutkan');
  });

  test('evaluates quiz attempts, handles incorrect choices and retries to full score', () => {
    for (const q of quiz) {
      // Option 0 is correct
      expect(evaluateQuiz(q, 0)).toBe(true);

      // Options 1, 2, 3 are distractors
      expect(evaluateQuiz(q, 1)).toBe(false);
      expect(evaluateQuiz(q, 2)).toBe(false);
      expect(evaluateQuiz(q, 3)).toBe(false);
    }

    // Interactive user flow simulation:
    // User tries Case 1 with wrong answer (1), fails, then retries with correct answer (0)
    let userAttempts = [1];
    expect(evaluateQuiz(quiz[0], userAttempts[0])).toBe(false);
    userAttempts.push(0);
    expect(evaluateQuiz(quiz[0], userAttempts[1])).toBe(true);

    // Scoring all 5 questions
    const userAnswers = [0, 0, 0, 0, 0];
    const score = userAnswers.reduce((total, ans, idx) => total + (evaluateQuiz(quiz[idx], ans) ? 1 : 0), 0);
    expect(score).toBe(5);
  });
});

describe('Curriculum & Study Engine - Markdown Rendering & XSS Security', () => {
  test('escapes HTML tags and prevents script injection', () => {
    const malicious = '# Security Test\n\n<script>alert("xss")</script>\n<img src=x onerror="steal()"/>';
    const html = renderToStaticMarkup(React.createElement(MarkdownReader, { markdown: malicious, onModule: () => {} }));

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;img src=x onerror=&quot;steal()&quot;/&gt;');
  });

  test('blocks javascript: and data: pseudo-protocols in links', () => {
    const links = [
      '[Malicious Script](javascript:alert(document.cookie))',
      '[Data URI](data:text/html,<script>alert(1)</script>)',
      '[Safe Link](https://help.sap.com/viewer/doc)',
    ].join('\n\n');

    const html = renderToStaticMarkup(React.createElement(MarkdownReader, { markdown: links, onModule: () => {} }));

    // Dangerous links must NEVER become an <a href="javascript:...">
    expect(html).not.toContain('href="javascript:');
    expect(html).not.toContain('href="data:');
    expect(html).toContain('<span>Malicious Script</span>');
    expect(html).toContain('<span>Data URI</span>');

    // Safe HTTPS links render as safe external anchors
    expect(html).toContain('<a href="https://help.sap.com/viewer/doc" target="_blank" rel="noopener noreferrer">Safe Link</a>');
  });

  test('renders internal curriculum module links as navigation buttons and blocks vbscript: links', () => {
    const linkMd = 'Lihat panduan lengkap di [Modul 02: SAP FI](02-sap-fi-financial-accounting.md) atau [Bad](vbscript:msgbox(1)).';
    const element = React.createElement(MarkdownReader, {
      markdown: linkMd,
      onModule: () => {},
    });
    const html = renderToStaticMarkup(element);
    expect(html).not.toContain('vbscript:');

    expect(html).toContain('<button class="text-link">Modul 02: SAP FI</button>');
  });

  test('renders code fences, Mermaid diagrams, tables, and collapsible details safely', () => {
    const content = [
      '# Architectural Diagram',
      '',
      '```mermaid',
      'graph TD',
      '  A[PR] --> B[PO]',
      '```',
      '',
      '| T-Code | Fungsi | Modul |',
      '| :--- | :--- | :--- |',
      '| `ME21N` | Buat PO | MM |',
      '| `CJ20N` | Project Builder | PS |',
      '',
      '<details>',
      '<summary>Buka detail konfigurasi</summary>',
      'Parameter SPRO IMG aktif.',
      '</details>',
      '',
      '> Catatan implementasi penting.',
      '- Poin 1',
      '- Poin 2',
    ].join('\n');

    const html = renderToStaticMarkup(React.createElement(MarkdownReader, { markdown: content, onModule: () => {} }));

    // Mermaid wrapper
    expect(html).toContain('Diagram Mermaid (sumber)');
    expect(html).toContain('graph TD');

    // Table rendering
    expect(html).toContain('<div class="table-wrap"><table>');
    expect(html).toContain('<th>T-Code</th>');
    expect(html).toContain('<td><code>ME21N</code></td>');

    // Details summary preserves original summary text
    expect(html).toContain('<details><summary>Buka detail konfigurasi</summary>');
    expect(html).toContain('Parameter SPRO IMG aktif.');
    // Blockquote and lists
    expect(html).toContain('<blockquote>Catatan implementasi penting.</blockquote>');
    expect(html).toContain('<p class="list-item">• Poin 1</p>');
  });
});
