import type { Metadata } from 'next'
import { SITE } from '@/lib/site'

export const metadata: Metadata = { title: '개인정보처리방침' }

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. 모으는 정보',
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Google 로그인 시 Google 이 알려 주는 이메일 주소와 이름</li>
        <li>가입 신청서에 직접 적은 이름, 학교급, 학교 이름, 교사 확인용 메모</li>
        <li>사이트에 올린 자료(파일·링크·설명), 글, 댓글, 좋아요·담아 두기, 신고 내용</li>
      </ul>
    ),
  },
  {
    title: '2. 쓰는 곳',
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>수학 선생님인지 확인하고 가입을 승인하는 데</li>
        <li>자료실·게시판 등 사이트 기능을 제공하는 데</li>
        <li>규칙을 어긴 내용을 확인하고 조치하는 데</li>
      </ul>
    ),
  },
  {
    title: '3. 누가 볼 수 있나요',
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>이름과 학교급: 승인된 회원에게 보여요.</li>
        <li>이메일, 학교 이름, 교사 확인용 메모: 본인과 관리자만 볼 수 있어요.</li>
        <li>모은 정보를 다른 곳에 팔거나 넘기지 않아요.</li>
      </ul>
    ),
  },
  {
    title: '4. 보관하는 곳과 기간',
    body: (
      <p>
        회원 정보와 자료는 Supabase(데이터 저장 서비스, 서울 지역)에 보관해요. 탈퇴를 요청하시면 회원 정보와 올리신 자료·글을
        지워 드려요.
      </p>
    ),
  },
  {
    title: '5. 문의',
    body: (
      <p>
        개인정보에 관한 문의나 탈퇴 요청은 관리자 이메일{' '}
        <a href={`mailto:${SITE.contactEmail}`} className="font-semibold text-brand-700 underline">
          {SITE.contactEmail}
        </a>{' '}
        로 보내 주세요.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="page-title">개인정보처리방침</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {SITE.name} 는 수학 선생님들이 자료를 나누는 비영리 커뮤니티예요. 꼭 필요한 정보만 모으고, 아래처럼 다뤄요.
      </p>
      <div className="mt-6 space-y-4">
        {SECTIONS.map((s) => (
          <section key={s.title} className="card p-5">
            <h2 className="font-bold text-slate-900">{s.title}</h2>
            <div className="mt-2 text-sm leading-relaxed text-slate-700">{s.body}</div>
          </section>
        ))}
      </div>
      <p className="mt-6 text-xs text-slate-400">시행일: 2026년 10월 20일</p>
    </article>
  )
}
