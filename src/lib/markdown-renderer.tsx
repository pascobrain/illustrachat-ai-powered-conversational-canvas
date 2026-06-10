import React, { useEffect, useRef, memo } from 'react';
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
});
const Mermaid = memo(({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const id = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);
  useEffect(() => {
    const renderDiagram = async () => {
      if (ref.current && chart) {
        try {
          ref.current.innerHTML = '';
          const { svg } = await mermaid.render(id.current, chart);
          ref.current.innerHTML = svg;
        } catch (error) {
          console.error('Mermaid render failed:', error);
          ref.current.innerHTML = `<pre class="text-xs text-destructive p-2 bg-destructive/10 rounded">Invalid diagram syntax</pre>`;
        }
      }
    };
    renderDiagram();
  }, [chart]);
  return (
    <div 
      ref={ref} 
      className="mermaid-container flex justify-center py-6 px-4 overflow-x-auto bg-white dark:bg-zinc-900/50 rounded-2xl border border-border my-6 shadow-sm transition-all" 
    />
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
                "rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]",
                !inline && "block p-4 overflow-x-auto my-4 border border-border bg-muted/30"
              )} 
              {...props}
            >
              {children}
            </code>
          );
        },
        pre({ children }) {
          return <pre className="p-0 bg-transparent rounded-lg">{children}</pre>;
        },
        a({ children, href }) {
          return (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-turquoise hover:underline font-medium"
            >
              {children}
            </a>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}