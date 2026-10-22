'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { isCorrect, problemOfDay, randomProblem, type Problem } from '@/lib/problems'
import { SITE } from '@/lib/site'
import { useAuth } from './AuthProvider'
import { Markdown } from './Markdown'

const SOLVED_KEY = 'smh-problems-solved'
const dateFmt = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })

function readSolved(): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(SOLVED_KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((n) => typeof n === 'number') : []
  } catch {
    return []
  }
}

/**
 * 첫 화면 대문의 "오늘의 수학 문제".
 * 날마다 문제가 바뀌고, 답을 적어 맞혀 보고, 힌트·풀이를 열어 볼 수 있다.
 * 맞힌 문제는 이 브라우저에 기억해 둔다 (로그인 없이도 됨).
 */
export function DailyProblem() {
  const { isApproved } = useAuth()
  // 날짜로 고르는 문제는 서버와 브라우저가 다를 수 있어서, 화면이 뜬 뒤에 정한다
  const [problem, setProblem] = useState<Problem | null>(null)
  const [isToday, setIsToday] = useState(true)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [tries, setTries] = useState(0)
  const [hint, setHint] = useState(false)
  const [solution, setSolution] = useState(false)
  const [solved, setSolved] = useState<number[]>([])

  useEffect(() => {
    setProblem(problemOfDay())
    setSolved(readSolved())
  }, [])

  function show(p: Problem, today: boolean) {
    setProblem(p)
    setIsToday(today)
    setInput('')
    setResult(null)
    setTries(0)
    setHint(false)
    setSolution(false)
  }

  function check(e: React.FormEvent) {
    e.preventDefault()
    if (!problem || !input.trim()) return
    if (isCorrect(problem, input)) {
      setResult('correct')
      if (!solved.includes(problem.id)) {
        const next = [...solved, problem.id]
        setSolved(next)
        try {
          localStorage.setItem(SOLVED_KEY, JSON.stringify(next))
        } catch {}
      }
    } else {
      setResult('wrong')
      setTries((n) => n + 1)
    }
  }

  const done = problem ? solved.includes(problem.id) : false

  return (
    <section
      className="card overflow-hidden border-brand-200 shadow-sm"
      aria-labelledby="daily-problem-title"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-brand-100 bg-gradient-to-r from-brand-50 to-white px-4 py-3 sm:px-5">
        <h2 id="daily-problem-title" className="font-bold text-slate-900">
          {isToday ? '🧩 오늘의 수학 문제' : '🎲 다른 문제'}
        </h2>
        {problem && isToday && <span className="text-xs text-slate-500">{dateFmt.format(new Date())}</span>}
        {problem && (
          <span className="ml-auto flex items-center gap-1.5">
            {done && <span className="badge bg-brand-600 text-white">✔ 풀었어요</span>}
            <span className="badge-brand">{problem.level}</span>
            <span className="badge">{problem.unit}</span>
          </span>
        )}
      </div>

      <div className="px-4 py-4 sm:px-5">
        {!problem ? (
          <div className="h-16 animate-pulse rounded-lg bg-slate-100" aria-hidden />
        ) : (
          <>
            <div className="text-[15px] leading-relaxed text-slate-800">
              <Markdown>{problem.body}</Markdown>
            </div>

            <form onSubmit={check} className="mt-4 flex gap-2">
              <input
                className="input py-2.5"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  if (result === 'wrong') setResult(null)
                }}
                placeholder={done ? '이미 맞힌 문제예요. 다시 풀어 봐도 좋아요' : '답을 적어 보세요'}
                aria-label="답"
                autoComplete="off"
                enterKeyHint="done"
              />
              <button className="btn-primary shrink-0 px-5" disabled={!input.trim()}>
                확인
              </button>
            </form>

            {result === 'correct' && (
              <p className="mt-3 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-800" role="status">
                🎉 정답이에요! {tries > 0 ? `${tries + 1}번 만에 맞혔어요.` : '한 번에 맞혔어요.'}
              </p>
            )}
            {result === 'wrong' && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
                아직이에요. 다시 생각해 볼까요?{tries >= 2 && !hint && ' 힌트를 열어 봐도 좋아요.'}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <button type="button" className="btn-secondary btn-sm" onClick={() => setHint((v) => !v)} aria-expanded={hint}>
                💡 힌트 {hint ? '닫기' : '보기'}
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => setSolution((v) => !v)}
                aria-expanded={solution}
              >
                📖 풀이 {solution ? '닫기' : '보기'}
              </button>
              <button type="button" className="btn-ghost btn-sm" onClick={() => show(randomProblem(problem.id), false)}>
                🎲 다른 문제
              </button>
              {!isToday && (
                <button type="button" className="btn-ghost btn-sm" onClick={() => show(problemOfDay(), true)}>
                  오늘의 문제로
                </button>
              )}
              {isApproved ? (
                <Link
                  href={`/board/new?category=${encodeURIComponent('수업 나눔')}&title=${encodeURIComponent(`[오늘의 문제] ${problem.title}`)}`}
                  className="ml-auto font-semibold text-brand-700 hover:underline"
                >
                  💬 풀이·수업 아이디어 나누기 →
                </Link>
              ) : (
                <span className="ml-auto text-xs text-slate-500">선생님으로 가입하면 풀이와 수업 활용 아이디어를 나눌 수 있어요</span>
              )}
            </div>

            {hint && (
              <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <b className="text-slate-900">힌트</b>
                <Markdown small>{problem.hint}</Markdown>
              </div>
            )}
            {solution && (
              <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <b className="text-slate-900">풀이</b>
                <Markdown small>{problem.solution}</Markdown>
              </div>
            )}
          </>
        )}
      </div>

      {/* 학생용 짝 사이트: 같은 날, 학생들은 ShrekMath 에서 한 문제를 풀고 AI 첨삭을 받는다 */}
      <a
        href={SITE.shrekMathUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 border-t border-brand-100 bg-brand-50/60 px-4 py-2.5 text-sm hover:bg-brand-50 sm:px-5"
      >
        <span className="text-lg leading-none">🎓</span>
        <span className="min-w-0 flex-1 leading-snug">
          <b className="text-slate-900">ShrekMath</b>
          <span className="text-slate-600"> — 학생들은 여기서 오늘의 문제를 풀어요. 풀이 사진을 올리면 AI가 채점·첨삭해요.</span>
        </span>
        <span className="shrink-0 font-semibold text-brand-700 transition group-hover:translate-x-0.5">바로 가기 ↗</span>
      </a>
    </section>
  )
}
