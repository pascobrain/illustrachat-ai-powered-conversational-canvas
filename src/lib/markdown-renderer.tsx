import React, { useEffect, useRef, memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import mermaid from 'mermaid';
import { cn } from './utils';
interface MarkdownRendererProps {
  content: string;
}
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
  flowchart: { useMaxWidth: true, htmlLabels: true },
});
// Simple render cache to prevent re-renders of stable diagrams
const mermaidCache = new Map<string, string>();
const Mermaid = memo(({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>(mermaidCache.get(chart) || '');
  const renderTimeout = useRef<NodeJS.Timeout>();
  useEffect(() => {
    // Debounce rendering during streaming to save CPU
    clearTimeout(renderTimeout.current);
    if (mermaidCache.has(chart)) {
      setSvg(mermaidCache.get(chart)!);
      return;
    }
    renderTimeout.current = setTimeout(async () => {
      if (ref.current && chart) {
        try {
          const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
          const { svg: renderedSvg } = await mermaid.render(id, chart);
          mermaidCache.set(chart, renderedSvg);
          setSvg(renderedSvg);
        } catch (error) {
          console.warn('Mermaid render failed (likely partial syntax during stream)');
          // Don't show error while it might be typing, wait for final
        }
      }
    }, 400); // 400ms debounce
    return () => clearTimeout(renderTimeout.current);
  }, [chart]);
  return (
    <div
      ref={ref}
      className="mermaid-container flex justify-center py-6 px-4 overflow-x-auto bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-border/40 my-6 shadow-sm transition-all"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    >
      {!svg && (
        <div className="flex items-center gap-2 text-muted-foreground/40 py-10">
          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Rendering Diagram...</span>
        </div>
      )}
    </div>
  );
});
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const isMermaid = match && match[1] === 'mermaid';
          const codeContent = String(children).replace(/\n$/, '');
          if (!inline && isMermaid) {
            return <Mermaid chart={codeContent} />;
          }
          return (
            <code
              className={cn(
                className,
                "rounded-lg bg-muted/60 px-1.5 py-0.5 font-mono text-[0.9em]",
                !inline && "block p-5 overflow-x-auto my-5 border border-border/40 bg-muted/20"
              )}
              {...props}
            >
              {children}
            </code>
          );
        },
        pre({ children }) {
          return <pre className="p-0 bg-transparent m-0 overflow-visible">{children}</pre>;
        },
        a({ children, href }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-turquoise hover:underline font-bold transition-all decoration-turquoise/30"
            >
              {children}
            </a>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-6 border border-border/40 rounded-2xl">
              <table className="w-full text-left border-collapse">{children}</table>
            </div>
          );
        },
        th({ children }) {
          return <th className="p-3 bg-muted/20 border-b border-border/40 font-bold text-xs uppercase tracking-wider">{children}</th>;
        },
        td({ children }) {
          return <td className="p-3 border-b border-border/20 text-sm">{children}</td>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}