import type { Metadata } from 'next'

export const metadata: Metadata = { title: '이용 규칙' }

const RULES: { title: string; items: string[] }[] = [
  {
    title: '1. 누가 이용하나요',
    items: [
      '중·고등학교 수학 선생님만 이용할 수 있어요. 가입 신청을 하면 관리자가 확인한 뒤 승인해요.',
      '계정은 혼자만 써 주세요. 학생이나 다른 사람에게 빌려주면 안 돼요.',
    ],
  },
  {
    title: '2. 저작권',
    items: [
      '직접 만들었거나 공유가 허락된 자료만 올려 주세요.',
      '교과서·시중 문제집·EBS 교재를 스캔하거나 그대로 옮긴 자료는 올리지 않아요.',
      '다른 자료를 참고했다면 설명에 출처를 적어 주세요.',
      '여기서 받은 자료는 내 수업에 자유롭게 쓰되, 다른 곳에 다시 올리거나 팔 때는 만든 선생님의 허락을 받아요.',
    ],
  },
  {
    title: '3. 학생 개인정보',
    items: [
      '학생 이름·학번·성적·사진·연락처가 들어간 파일은 올리지 않아요.',
      '학생 답안이나 작품을 예시로 쓸 때는 이름과 얼굴을 가리고, 필요하면 동의를 받아요.',
    ],
  },
  {
    title: '4. 평가 문항',
    items: [
      '아직 시행하지 않은 시험·수행평가 문항은 올리지 않아요.',
      '시행이 끝난 문항도 학교 방침을 확인한 뒤 나눠 주세요.',
    ],
  },
  {
    title: '5. 서로 존중해요',
    items: [
      '다른 선생님의 수업 방식과 자료를 존중하고, 의견은 부드럽게 나눠요.',
      '광고·홍보, 특정인 비방, 정치적 논쟁은 삼가 주세요.',
    ],
  },
  {
    title: '6. 신고와 조치',
    items: [
      '규칙에 맞지 않는 내용을 보면 [신고]를 눌러 주세요. 누가 신고했는지는 작성자에게 보이지 않아요.',
      '관리자가 확인한 뒤 내용을 지우거나, 반복되면 이용을 정지할 수 있어요.',
    ],
  },
]

export default function RulesPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="page-title">이용 규칙</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Shrek Math Hub 는 수학 선생님들이 서로 믿고 자료를 나누는 곳이에요. 모두가 안심하고 쓸 수 있도록 아래 약속을
        지켜 주세요.
      </p>
      <div className="mt-6 space-y-4">
        {RULES.map((r) => (
          <section key={r.title} className="card p-5">
            <h2 className="font-bold text-slate-900">{r.title}</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700">
              {r.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  )
}
