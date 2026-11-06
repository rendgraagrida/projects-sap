import { describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildDictionaries, buildStudyIndex, dictionaryCodes, evaluateQuiz, parseCurriculum, searchStudy, type DictionaryEntry, type Module, type Quiz } from '../src/lib/study-engine';
import { dictionaries, modules, studyIndex } from '../src/data/curriculum';
import { MarkdownReader } from '../src/components/MarkdownReader';

const onModule = () => {};

describe('Heading navigation and search', () => {
  test('disambiguates repeated heading anchors and ignores headings in fenced examples', () => {
    const module = parseCurriculum('sample', 'sample.md', '# Start\n\n## Topic\nFirst\n\n```md\n## Hidden\n```\n\n## Topic\nSecond');
    expect(module.headings.map(heading => heading.id)).toEqual(['start', 'topic', 'topic-2']);
    expect(module.headings.map(heading => [heading.startLine, heading.endLine])).toEqual([[1, 2], [3, 9], [10, 11]]);
  });

  test('requires every normalized search term and ranks heading matches first', () => {
    const module = parseCurriculum('sample', 'sample.md', '# Intro\n\n## General\nAccount posting for stock\n\n## Stock\nAccount posting\n\n## Other\nAccount only');
    const index = buildStudyIndex([module]);
    expect(searchStudy(index, '  STOCK   posting ').map(hit => hit.headingId)).toEqual(['stock', 'general']);
    expect(searchStudy(index, 'stock impossible')).toEqual([]);
    expect(searchStudy(index, 'stock', 1).map(hit => hit.headingId)).toEqual(['stock']);
    expect(searchStudy(index, 'stock', 0)).toEqual([]);
  });

  test('treats spaced and compact budget message codes as the same query', () => {
    const index = buildStudyIndex([parseCurriculum('sample', 'sample.md', '# BP 604\nBudget unavailable\n\n## Tax\nOther content')]);
    expect(searchStudy(index, 'BP604')).toEqual(searchStudy(index, 'bp   604'));
    expect(searchStudy(index, '  ')).toEqual([]);
  });
});

describe('Grouped dictionary consumer contract', () => {
  test('keeps grouped codes in one entry but permits exact individual command lookup', () => {
    const raw = '## 1. Transactions\n\n| Kategori | T-Code GUI | Nama | App |\n| --- | --- | --- | --- |\n| Master | `TX01` / `TX02` / `TX03` | Material operations | Product app |';
    const entries = buildDictionaries([parseCurriculum('06', 'dictionary.md', raw)]);
    expect(entries.map(entry => entry.code)).toEqual(['TX01 / TX02 / TX03']);
    expect(dictionaryCodes(entries[0])).toEqual(['TX01', 'TX02', 'TX03']);
    expect(dictionaryCodes(entries[0]).includes('TX0')).toBe(false);
  });

  test('does not resolve table BPGE as business partner through a substring match', () => {
    const raw = '## 3. Tables\n\n- `BPGE` (Overall budget)\n- `BPGE` (Repeated source reference)';
    const entries = buildDictionaries([parseCurriculum('06', 'dictionary.md', raw)]);
    expect(entries.map(entry => [entry.code, entry.moduleId])).toEqual([['BPGE', '06']]);
  });
});

describe('Quiz answer boundaries', () => {
  test('accepts only the authored choice rather than assuming the first option is correct', () => {
    const question = { id: 'q', title: 'Budget', question: 'Choose', answer: 'Explanation', options: ['a', 'b', 'c', 'd'], correct: 2 };
    expect([0, 1, 2, 3].map(selected => evaluateQuiz(question, selected))).toEqual([false, false, true, false]);
    for (const selected of [-1, 4, 2.5, NaN, Infinity]) expect(evaluateQuiz(question, selected)).toBe(false);
  });
  test('builds all 10 comprehensive telco study cases covering MM, PS, FI, and SD with valid answers', () => {
    const { buildQuiz } = require('../src/lib/study-engine');
    const allQuiz = buildQuiz(modules);
    expect(allQuiz).toHaveLength(10);
    for (const q of allQuiz) {
      expect(q.options).toHaveLength(4);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(4);
      expect(evaluateQuiz(q, q.correct)).toBe(true);
    }
    const ids = allQuiz.map((q: Quiz) => q.id);
    expect(ids).toEqual(['case-01', 'case-02', 'case-03', 'case-04', 'case-05', 'case-06', 'case-07', 'case-08', 'case-09', 'case-10']);
  });
});

describe('Markdown trust boundary', () => {
  test('removes executable HTML, event handlers, and dangerous URLs', () => {
    const markdown = '# Heading\n\n<script>alert(1)</script>\n<iframe src="https://example.com"></iframe>\n<img src="x" onerror="alert(1)">\n\n[bad](javascript:alert) [bad2](data:text/html,test) [bad3](vbscript:alert)';
    const html = renderToStaticMarkup(createElement(MarkdownReader, { markdown, onModule }));
    expect(html).not.toMatch(/<script|<iframe|onerror=|href="(?:javascript:|data:|vbscript:)/i);
    expect(html).toContain('<h1');
  });

  test('does not mistake an external filename match for internal module navigation', () => {
    const markdown = '[External](https://example.com/01-enterprise-structure-and-master-data.md)';
    const html = renderToStaticMarkup(createElement(MarkdownReader, { markdown, onModule }));
    expect(html).toContain('href="https://example.com/01-enterprise-structure-and-master-data.md"');
    expect(html).not.toContain('<button');
    expect(html).toContain('noopener noreferrer');
  });

  test('preserves nested disclosures and distinct heading anchors inside them', () => {
    const markdown = '# Topic\n\n<details>\n<summary>Outer</summary>\n\n## Topic\n\n<details>\n<summary>Inner</summary>\n\n### Topic\n\nContent\n\n</details>\n</details>';
    const html = renderToStaticMarkup(createElement(MarkdownReader, { markdown, onModule }));
    expect(html.match(/<details>/g)?.length).toBe(2);
    expect(html).toContain('id="topic-2"');
    expect(html).toContain('id="topic-3"');
  });
});
describe('Module 07 SAP SD Integration', () => {
  test('parses module 07 and finds SD topics in study index', () => {
    expect(modules.map((m: Module) => m.id)).toContain('07');
    const sdHits = searchStudy(studyIndex, 'VKOA');
    expect(sdHits.length).toBeGreaterThan(0);
    const va01Entry = dictionaries.find((d: DictionaryEntry) => dictionaryCodes(d).includes('VA01'));
    expect(va01Entry).toBeDefined();
    expect(va01Entry?.explanation).toContain('Sales Order');
    const vkoaEntry = dictionaries.find((d: DictionaryEntry) => dictionaryCodes(d).includes('VKOA'));
    expect(vkoaEntry).toBeDefined();
    expect(vkoaEntry?.explanation).toContain('Revenue Account Determination');
  });
});
