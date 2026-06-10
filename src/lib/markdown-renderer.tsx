import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import mermaid from 'mermaid';
interface MarkdownRendererProps {
  content: string;
}
mermaid.initialize({
  startOnLoad: true,
  theme: 'neutral',
  securityLevel: 'loose',
});
const Mermaid = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && chart) {
      ref.current.innerHTML = chart;
      ref.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, [chart]);
  return <div ref={ref} className="mermaid flex justify-center py-4 overflow-x-auto bg-white rounded-lg my-4" />;
};
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const isMermaid = match && match[1] === 'mermaid';
          if (!inline && isMermaid) {
            return <Mermaid chart={String(children).replace(/\n$/, '')} />;
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        pre({ children }) {
          return <pre className="p-0 bg-transparent rounded-lg">{children}</pre>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}