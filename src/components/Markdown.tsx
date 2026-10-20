'use client'

import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

/** 글·댓글 본문. $x^2$ 는 수식으로, 엔터는 줄바꿈으로 보여 준다. */
export function Markdown({ children, small = false }: { children: string; small?: boolean }) {
  return (
    <div
      className={`prose prose-slate max-w-none prose-a:text-brand-700 prose-pre:bg-slate-800 ${
        small ? 'prose-sm' : ''
      } prose-p:my-2 prose-li:my-0.5`}
    >
      <ReactMarkdown
        // "1~3단원" 같은 물결표가 취소선이 되지 않도록 singleTilde 끔
        remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkMath, remarkBreaks]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={{
          a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
