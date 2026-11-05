import { createElement, useEffect, useId, useMemo, useRef, useState } from 'react';
import ReactMarkdown, { defaultUrlTransform, type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { modules } from '../data/curriculum';
import type { Mermaid } from 'mermaid';
import { parseCurriculum, slugHeading } from '../lib/study-engine';

interface Props {
  markdown: string;
  onModule: (id: string, anchor?: string) => void;
  anchor?: string | null;
  request?: number;
}

const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'details', 'summary'],
  attributes: { ...defaultSchema.attributes, code: [...(defaultSchema.attributes?.code ?? []), ['className', /^language-./, 'math-inline', 'math-display']] },
};
let mermaidLibrary: Promise<Mermaid> | null = null;
function MermaidDiagram({ source }: { source: string }) {
  const id = `sap-diagram-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setImage('');
    setError('');
    mermaidLibrary ??= import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral', suppressErrorRendering: true, htmlLabels: false, flowchart: { htmlLabels: false } });
      return mermaid;
    });
    void mermaidLibrary.then(mermaid => mermaid.render(id, source)).then(result => {
      if (active) setImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.svg)}`);
    }).catch(() => { if (active) setError('Diagram tidak dapat dirender. Periksa sumber diagram berikut.'); });
    return () => { active = false; };
  }, [id, source]);
  if (error) return <div><p role="alert">{error}</p><pre><code>{source}</code></pre></div>;
  return image ? <figure className="mermaid-diagram"><img src={image} alt="Diagram alur atau relasi SAP dari materi" /></figure> : <p role="status">Memuat diagram…</p>;
}

export function MarkdownReader({ markdown, onModule, anchor, request }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const headings = useMemo(() => new Map(parseCurriculum('', '', markdown).headings.map(heading => [heading.startLine, heading.id])), [markdown]);
  useEffect(() => {
    if (!root.current || !anchor) return;
    const target = root.current.querySelector<HTMLElement>(`#${CSS.escape(anchor)}`);
    if (!target) return;
    let parent = target.parentElement;
    while (parent && parent !== root.current) {
      if (parent instanceof HTMLDetailsElement) parent.open = true;
      parent = parent.parentElement;
    }
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start' });
  }, [anchor, request, markdown]);

  const components: Components = {
    a: ({ href, children }) => {
      if (!href) return <span>{children}</span>;
      if (/^https?:\/\//i.test(href)) return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
      const [file, hash] = href.split('#');
      const module = modules.find(item => file.replace(/^\.\//, '') === item.fileName);
      if (module) return <button type="button" className="text-link" onClick={() => onModule(module.id, hash ? decodeURIComponent(hash) : undefined)}>{children}</button>;
      if (!file && hash) return <a href={href} onClick={event => {
        event.preventDefault();
        const target = root.current?.querySelector<HTMLElement>(`#${CSS.escape(decodeURIComponent(hash))}`);
        if (!target) return;
        let parent = target.parentElement;
        while (parent && parent !== root.current) {
          if (parent instanceof HTMLDetailsElement) parent.open = true;
          parent = parent.parentElement;
        }
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: 'start' });
      }}>{children}</a>;
      return <span>{children}</span>;
    },
    pre: ({ children }) => <>{children}</>,
    code: ({ className, children }) => {
      const value = String(children).replace(/\n$/, '');
      if (className === 'language-mermaid') return <MermaidDiagram source={value} />;
      return className || String(children).endsWith('\n')
        ? <pre><code className={className}>{value}</code></pre>
        : <code>{children}</code>;
    },
    table: ({ children }) => <div className="table-wrap"><table>{children}</table></div>,
  };
  for (const tag of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const) {
    components[tag] = ({ node, children }) => createElement(tag, { id: headings.get(node?.position?.start.line ?? -1) ?? slugHeading(String(children)) }, children);
  }
  return <div className="markdown" ref={root}>
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], [rehypeKatex, { trust: false, throwOnError: false }]]} components={components} urlTransform={url => /^https?:\/\//i.test(url) || url.startsWith('#') || /^\.?\/?[\w-]+\.md(?:#.*)?$/.test(url) ? defaultUrlTransform(url) : ''}>
      {markdown}
    </ReactMarkdown>
  </div>;
}
