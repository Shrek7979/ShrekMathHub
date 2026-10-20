'use client'

import { useRef, useState } from 'react'
import { Markdown } from './Markdown'

// [버튼 이름, 넣을 LaTeX, 커서를 놓을 위치(넣은 글자 기준, 없으면 맨 끝)]
const MATH_SNIPPETS: [string, string, number?][] = [
  ['분수', '\\frac{a}{b}', 6],
  ['√', '\\sqrt{x}', 6],
  ['xⁿ', 'x^{n}', 3],
  ['aₙ', 'a_{n}', 3],
  ['Σ', '\\sum_{k=1}^{n}'],
  ['∫', '\\int_{a}^{b} f(x)\\,dx'],
  ['lim', '\\lim_{x \\to a}'],
  ['벡터', '\\vec{a}', 5],
  ['≤', '\\le '],
  ['≠', '\\ne '],
  ['×', '\\times '],
  ['θ', '\\theta'],
  ['π', '\\pi'],
]

type Props = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  id?: string
}

export function MarkdownEditor({ value, onChange, placeholder, rows = 10, id }: Props) {
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const ref = useRef<HTMLTextAreaElement>(null)

  /** 커서 자리에 글자를 넣고, 커서를 caret 만큼 옮긴다 */
  function insert(text: string, caret = text.length) {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = value.slice(0, start) + text + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + caret, start + caret)
    })
  }

  function insertMath(tex: string, caret = tex.length) {
    const el = ref.current
    if (!el) return
    if (insideMath(value, el.selectionStart)) insert(tex, caret)
    else insert(`$${tex}$`, caret + 1)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
      <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        {(['write', 'preview'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1 text-xs font-semibold ${
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t === 'write' ? '쓰기' : '미리보기'}
          </button>
        ))}
        <span className="ml-auto hidden text-[11px] text-slate-400 sm:inline">$x^2$ 처럼 $로 감싸면 수식이 돼요</span>
      </div>

      {tab === 'write' ? (
        <>
          <div className="flex flex-wrap gap-1 border-b border-slate-100 px-2 py-1.5">
            <ToolButton onClick={() => insert('$ $', 1)} title="수식 넣기 ($ $)">
              수식
            </ToolButton>
            <ToolButton onClick={() => insert('\n$$\n\n$$\n', 4)} title="가운데 큰 수식 ($$ $$)">
              큰 수식
            </ToolButton>
            <span className="mx-1 w-px bg-slate-200" />
            {MATH_SNIPPETS.map(([label, tex, caret]) => (
              <ToolButton key={label} onClick={() => insertMath(tex, caret)} title={tex}>
                {label}
              </ToolButton>
            ))}
            <span className="mx-1 w-px bg-slate-200" />
            <ToolButton onClick={() => insert('**굵게**', 2)} title="굵게">
              <b>B</b>
            </ToolButton>
            <ToolButton onClick={() => insert('\n- ', 3)} title="목록">
              • 목록
            </ToolButton>
          </div>
          <textarea
            id={id}
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            className="block w-full resize-y border-0 px-3 py-2 font-[inherit] text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </>
      ) : (
        <div className="min-h-[10rem] px-4 py-3">
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm text-slate-400">미리 볼 내용이 없어요.</p>}
        </div>
      )}
    </div>
  )
}

function ToolButton(props: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      title={props.title}
      className="rounded-md border border-transparent px-2 py-0.5 text-xs text-slate-600 hover:border-slate-200 hover:bg-white"
    >
      {props.children}
    </button>
  )
}

/** 커서가 이미 $…$ 또는 $$…$$ 안에 있는지 (그렇다면 $ 를 또 붙이지 않음) */
function insideMath(text: string, pos: number) {
  const before = text.slice(0, pos)
  const blocks = (before.match(/\$\$/g) ?? []).length
  if (blocks % 2 === 1) return true
  const singles = (before.replace(/\$\$/g, '').match(/\$/g) ?? []).length
  return singles % 2 === 1
}
