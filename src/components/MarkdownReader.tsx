import { Fragment, type ReactNode } from 'react';
import { modules } from '../data/curriculum';
import { slugHeading } from '../lib/study-engine';

interface Props { markdown: string; onModule: (id: string) => void }
function inline(text: string, onModule: (id: string) => void): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const module = modules.find(item => link[2].includes(item.fileName));
      if (module) return <button className="text-link" key={i} onClick={() => onModule(module.id)}>{link[1]}</button>;
      if (/^https?:\/\//i.test(link[2])) return <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer">{link[1]}</a>;
      return <span key={i}>{link[1]}</span>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
export function MarkdownReader({ markdown, onModule }: Props) {
  const lines = markdown.split(/\r?\n/);
  const nodes: ReactNode[] = [];
  const counts = new Map<string, number>();
  let i = 0;
  while (i < lines.length) {
    const current = lines[i];
    if (!current.trim()) { i++; continue; }
    const fence = /^\s*```(.*)/.exec(current);
    if (fence) {
      const content: string[] = []; i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) content.push(lines[i++]);
      if (i < lines.length) i++;
      nodes.push(<pre key={i}><small>{fence[1] === 'mermaid' ? 'Diagram Mermaid (sumber)' : fence[1]}</small><code>{content.join('\n')}</code></pre>); continue;
    }
    if (/^<details>/.test(current.trim())) {
      const content: string[] = []; i++;
      while (i < lines.length && !/^<\/details>/.test(lines[i].trim())) content.push(lines[i++]);
      if (i < lines.length) i++;
      const summaryLine = content.find(line => /^<summary>/.test(line.trim()));
      const summaryText = summaryLine ? summaryLine.replace(/<\/?(?:summary|b|strong|i|em)>/gi, '').trim() : 'Lihat jawaban dan pembahasan';
      const body = content.filter(line => !/^<summary>/.test(line.trim())).join('\n');
      nodes.push(<details key={i}><summary>{summaryText || 'Lihat jawaban dan pembahasan'}</summary><MarkdownReader markdown={body} onModule={onModule} /></details>); continue;
    }
    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(current);
    if (heading) {
      const text = heading[2].replace(/[`*_]/g, ''); const base = slugHeading(text) || 'section'; const count = (counts.get(base) ?? 0) + 1; counts.set(base, count); const id = count === 1 ? base : `${base}-${count}`;
      const contents = inline(heading[2], onModule);
      nodes.push(heading[1].length === 1 ? <h1 id={id} key={i}>{contents}</h1> : heading[1].length === 2 ? <h2 id={id} key={i}>{contents}</h2> : <h3 id={id} key={i}>{contents}</h3>); i++; continue;
    }
    if (current.startsWith('|') && i + 1 < lines.length && /^\|\s*[:-]/.test(lines[i + 1])) {
      const rows: string[][] = []; rows.push(current.split('|').slice(1, -1)); i += 2;
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++].split('|').slice(1, -1));
      nodes.push(<div className="table-wrap" key={i}><table><thead><tr>{rows[0].map((cell, j) => <th key={j}>{inline(cell.trim(), onModule)}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, j) => <tr key={j}>{row.map((cell, k) => <td key={k}>{inline(cell.trim(), onModule)}</td>)}</tr>)}</tbody></table></div>); continue;
    }
    if (/^\s*---+\s*$/.test(current)) { nodes.push(<hr key={i++} />); continue; }
    if (/^\s*[-*]\s/.test(current)) { nodes.push(<p className="list-item" key={i}>{inline(current.replace(/^\s*[-*]\s/, '• '), onModule)}</p>); i++; continue; }
    if (/^>/.test(current)) { nodes.push(<blockquote key={i}>{inline(current.replace(/^>\s?/, ''), onModule)}</blockquote>); i++; continue; }
    nodes.push(<p key={i}>{inline(current, onModule)}</p>); i++;
  }
  return <div className="markdown">{nodes}</div>;
}
