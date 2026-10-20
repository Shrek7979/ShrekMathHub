/** .env.local 이 없을 때 모든 화면 위에 보이는 연결 안내 */
export function SetupNotice() {
  return (
    <details className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <summary className="cursor-pointer font-semibold">
        아직 Supabase 가 연결되지 않았어요 — 화면은 미리 볼 수 있지만 가입·로그인은 연결 뒤에 돼요. (눌러서 방법 보기)
      </summary>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 leading-relaxed">
        <li>supabase.com 에서 새 프로젝트를 만들어요. (지역: Northeast Asia (Seoul))</li>
        <li>
          SQL Editor 에 <code className="badge">supabase/schema.sql</code> 내용을 붙여 넣고 Run 을 눌러요.
        </li>
        <li>
          <code className="badge">.env.local.example</code> 을 복사해 <code className="badge">.env.local</code> 로 이름을
          바꾸고, 프로젝트 주소와 Publishable key 를 넣어요.
        </li>
        <li>사이트를 껐다가 다시 켜요. 자세한 설명은 프로젝트 폴더의 설치가이드.md 에 있어요.</li>
      </ol>
    </details>
  )
}
