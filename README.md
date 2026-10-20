# Shrek Math Hub

중·고등학교 수학 선생님들이 수업 자료와 고민을 나누는 커뮤니티.
관리자가 승인한 선생님만 들어올 수 있어요.

- **처음 설정**: [설치가이드.md](설치가이드.md)
- **이용 규칙**: 사이트의 `/rules`

## 기능

| 화면 | 내용 |
|---|---|
| 첫 화면 | 새 자료·새 글·많이 받은 자료, 함께 보면 좋은 사이트 배너 (Shrek Edu Insight, GreenSori Map) |
| 자료실 | 학교급·과목(2022 개정)·단원·유형별 자료, 파일(HWP·PDF·PPT·GeoGebra 등 50MB) + 링크, 검색 |
| 게시판 | 질문·수업 나눔·평가·연수·업무·자유 |
| 공통 | 수식($x^2$, $$…$$) 입력 버튼과 미리보기, 댓글, 좋아요, 담아 두기, 신고 |
| 내 활동 | 내 자료·내 글·담아 둔 것·내 정보·비밀번호 |
| 관리자 | 가입 승인·거절, 회원 정지·관리자 지정, 신고 처리 |

## 구조

```
supabase/schema.sql     데이터베이스·권한·파일 저장소 설정 (Supabase SQL Editor 에서 실행)
scripts/test-db.mjs     위 설정의 보안 규칙 검사 (npm run test:db)
src/app/                화면 (Next.js App Router)
src/components/         공통 부품 (로그인 상태, 수식 편집기, 댓글, 배너 …)
src/lib/                Supabase 연결, 교육과정 목록, 파일 올리기·받기
```

- 화면: Next.js 15 + Tailwind CSS
- 로그인·데이터·파일: Supabase (보안은 데이터베이스의 RLS 규칙이 맡음)
- 수식: KaTeX

## 명령

```bash
npm run dev       # 내 PC 에서 켜기 (http://localhost:3000)
npm run build     # 올리기 전 점검
npm run test:db   # 보안 규칙 검사
```
