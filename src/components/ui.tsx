import Link from 'next/link'

export function Spinner({ label = '불러오는 중…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      {label}
    </div>
  )
}

export function Empty({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center text-sm text-slate-500">
      <p>{children}</p>
      {action}
    </div>
  )
}

/** 불러오기에 실패했을 때 (학교 와이파이가 끊기는 등) — '지워졌다'고 잘못 알리지 않게 */
export function LoadError({ onRetry, children }: { onRetry: () => void; children?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-10 text-center text-sm text-slate-600" role="alert">
      <p>{children ?? '불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.'}</p>
      <button className="btn-secondary btn-sm" onClick={onRetry}>
        다시 시도
      </button>
    </div>
  )
}

export function ErrorBox({ children }: { children: React.ReactNode }) {
  if (!children) return null
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
      {children}
    </p>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-bold text-slate-900 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-lg leading-none text-white">
        Σ
      </span>
      <span className="text-lg tracking-tight">
        Shrek <span className="text-brand-600">Math</span> Hub
      </span>
    </Link>
  )
}
