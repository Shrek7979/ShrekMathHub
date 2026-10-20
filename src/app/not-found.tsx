import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="card mx-auto mt-6 max-w-md px-6 py-12 text-center">
      <p className="text-4xl font-bold text-brand-600">404</p>
      <p className="mt-3 text-sm text-slate-600">찾는 화면이 없어요.</p>
      <Link href="/" className="btn-secondary mt-5">
        처음으로
      </Link>
    </div>
  )
}
