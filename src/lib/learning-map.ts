// 학습맵: 중1 → 진로 선택까지 단원이 어떻게 이어지는지 (2022 개정 교육과정 기준)
// 단원 이름은 curriculum.ts 의 UNIT_HINTS 와 똑같아야 자료 수가 맞게 붙는다.
import type { SchoolLevel } from './types'

export type Stage = { id: string; label: string; sub: string; level: SchoolLevel }
export type Strand = { id: string; label: string }
export type MapNode = {
  id: string
  unit: string
  subject: string
  level: SchoolLevel
  stage: string
  strand: string
}

/** 가로: 배우는 시기 */
export const STAGES: Stage[] = [
  { id: 'm1', label: '중1', sub: '중1 수학', level: '중' },
  { id: 'm2', label: '중2', sub: '중2 수학', level: '중' },
  { id: 'm3', label: '중3', sub: '중3 수학', level: '중' },
  { id: 'h1', label: '고1 공통', sub: '공통수학1 · 2', level: '고' },
  { id: 'h2', label: '일반 선택', sub: '대수 · 미적분Ⅰ · 확률과 통계', level: '고' },
  { id: 'h3', label: '진로 선택', sub: '기하 · 미적분Ⅱ', level: '고' },
]

/** 세로: 영역 (중학교 4개 영역 이름, 고등학교 단원은 가장 가까운 영역에) */
export const STRANDS: Strand[] = [
  { id: 'num', label: '수와 연산' },
  { id: 'rel', label: '변화와 관계' },
  { id: 'geo', label: '도형과 측정' },
  { id: 'dat', label: '자료와 가능성' },
]

const n = (id: string, stage: string, strand: string, subject: string, unit: string): MapNode => ({
  id,
  unit,
  subject,
  level: stage.startsWith('m') ? '중' : '고',
  stage,
  strand,
})

/** 같은 칸 안에서는 배우는 순서대로 */
export const NODES: MapNode[] = [
  // 중1
  n('m1-prime', 'm1', 'num', '중1 수학', '소인수분해'),
  n('m1-int', 'm1', 'num', '중1 수학', '정수와 유리수'),
  n('m1-expr', 'm1', 'rel', '중1 수학', '문자와 식'),
  n('m1-eq', 'm1', 'rel', '중1 수학', '일차방정식'),
  n('m1-coord', 'm1', 'rel', '중1 수학', '좌표평면과 그래프'),
  n('m1-prop', 'm1', 'rel', '중1 수학', '정비례와 반비례'),
  n('m1-basic', 'm1', 'geo', '중1 수학', '기본 도형'),
  n('m1-cons', 'm1', 'geo', '중1 수학', '작도와 합동'),
  n('m1-plane', 'm1', 'geo', '중1 수학', '평면도형의 성질'),
  n('m1-solid', 'm1', 'geo', '중1 수학', '입체도형의 성질'),
  n('m1-data', 'm1', 'dat', '중1 수학', '자료의 정리와 해석'),
  // 중2
  n('m2-rat', 'm2', 'num', '중2 수학', '유리수와 순환소수'),
  n('m2-calc', 'm2', 'rel', '중2 수학', '식의 계산'),
  n('m2-ineq', 'm2', 'rel', '중2 수학', '일차부등식'),
  n('m2-sys', 'm2', 'rel', '중2 수학', '연립일차방정식'),
  n('m2-lin', 'm2', 'rel', '중2 수학', '일차함수와 그래프'),
  n('m2-tri', 'm2', 'geo', '중2 수학', '삼각형의 성질'),
  n('m2-quad', 'm2', 'geo', '중2 수학', '사각형의 성질'),
  n('m2-sim', 'm2', 'geo', '중2 수학', '도형의 닮음'),
  n('m2-pyth', 'm2', 'geo', '중2 수학', '피타고라스 정리'),
  n('m2-prob', 'm2', 'dat', '중2 수학', '경우의 수와 확률'),
  // 중3
  n('m3-real', 'm3', 'num', '중3 수학', '제곱근과 실수'),
  n('m3-fact', 'm3', 'rel', '중3 수학', '다항식의 곱셈과 인수분해'),
  n('m3-qeq', 'm3', 'rel', '중3 수학', '이차방정식'),
  n('m3-qfn', 'm3', 'rel', '중3 수학', '이차함수와 그래프'),
  n('m3-trig', 'm3', 'geo', '중3 수학', '삼각비'),
  n('m3-circle', 'm3', 'geo', '중3 수학', '원의 성질'),
  n('m3-stat', 'm3', 'dat', '중3 수학', '대푯값과 산포도'),
  n('m3-corr', 'm3', 'dat', '중3 수학', '상관관계'),
  // 고1 공통
  n('h1-set', 'h1', 'num', '공통수학2', '집합과 명제'),
  n('h1-mat', 'h1', 'num', '공통수학1', '행렬'),
  n('h1-poly', 'h1', 'rel', '공통수학1', '다항식'),
  n('h1-eqin', 'h1', 'rel', '공통수학1', '방정식과 부등식'),
  n('h1-fn', 'h1', 'rel', '공통수학2', '함수와 그래프'),
  n('h1-geo', 'h1', 'geo', '공통수학2', '도형의 방정식'),
  n('h1-count', 'h1', 'dat', '공통수학1', '경우의 수'),
  // 일반 선택
  n('h2-seq', 'h2', 'num', '대수', '수열'),
  n('h2-explog', 'h2', 'rel', '대수', '지수함수와 로그함수'),
  n('h2-trig', 'h2', 'rel', '대수', '삼각함수'),
  n('h2-lim', 'h2', 'rel', '미적분Ⅰ', '함수의 극한과 연속'),
  n('h2-diff', 'h2', 'rel', '미적분Ⅰ', '미분'),
  n('h2-int', 'h2', 'rel', '미적분Ⅰ', '적분'),
  n('h2-count', 'h2', 'dat', '확률과 통계', '경우의 수'),
  n('h2-prob', 'h2', 'dat', '확률과 통계', '확률'),
  n('h2-stat', 'h2', 'dat', '확률과 통계', '통계'),
  // 진로 선택
  n('h3-slim', 'h3', 'num', '미적분Ⅱ', '수열의 극한'),
  n('h3-diff', 'h3', 'rel', '미적분Ⅱ', '미분법'),
  n('h3-int', 'h3', 'rel', '미적분Ⅱ', '적분법'),
  n('h3-conic', 'h3', 'geo', '기하', '이차곡선'),
  n('h3-space', 'h3', 'geo', '기하', '공간도형과 공간좌표'),
  n('h3-vec', 'h3', 'geo', '기하', '벡터'),
]

/** [먼저 배우는 단원, 이어서 배우는 단원] */
export const EDGES: [string, string][] = [
  // 수와 연산
  ['m1-prime', 'm1-int'],
  ['m1-int', 'm2-rat'],
  ['m2-rat', 'm3-real'],
  ['m3-real', 'h1-eqin'], // 복소수
  ['m3-real', 'h2-explog'], // 거듭제곱근, 실수 지수
  ['h2-seq', 'h3-slim'],
  // 식과 방정식
  ['m1-int', 'm1-expr'],
  ['m1-expr', 'm1-eq'],
  ['m1-expr', 'm2-calc'],
  ['m1-eq', 'm2-ineq'],
  ['m1-eq', 'm2-sys'],
  ['m2-calc', 'm3-fact'],
  ['m3-fact', 'm3-qeq'],
  ['m3-fact', 'h1-poly'],
  ['m3-qeq', 'h1-eqin'],
  ['m2-ineq', 'h1-eqin'],
  ['h1-poly', 'h1-eqin'],
  // 함수
  ['m1-coord', 'm1-prop'],
  ['m1-prop', 'm2-lin'],
  ['m2-sys', 'm2-lin'], // 일차함수와 일차방정식의 관계
  ['m2-lin', 'm3-qfn'],
  ['m3-qeq', 'm3-qfn'],
  ['m3-qfn', 'h1-eqin'], // 이차방정식과 이차함수
  ['m3-qfn', 'h1-fn'],
  ['h1-set', 'h1-fn'],
  ['h1-fn', 'h2-explog'],
  ['h1-fn', 'h2-trig'],
  ['h1-fn', 'h2-lim'],
  ['h2-lim', 'h2-diff'],
  ['h2-diff', 'h2-int'],
  ['h2-explog', 'h3-diff'],
  ['h2-trig', 'h3-diff'],
  ['h2-diff', 'h3-diff'],
  ['h2-int', 'h3-int'],
  ['h3-slim', 'h3-diff'],
  ['h3-diff', 'h3-int'],
  // 도형
  ['m1-basic', 'm1-cons'],
  ['m1-cons', 'm1-plane'],
  ['m1-cons', 'm2-tri'],
  ['m1-plane', 'm2-quad'],
  ['m2-tri', 'm2-quad'],
  ['m2-tri', 'm2-sim'],
  ['m2-sim', 'm2-pyth'],
  ['m2-sim', 'm3-trig'],
  ['m2-pyth', 'm3-trig'],
  ['m1-plane', 'm3-circle'],
  ['m3-trig', 'h2-trig'],
  ['m1-coord', 'h1-geo'],
  ['m2-lin', 'h1-geo'], // 직선의 방정식
  ['m2-pyth', 'h1-geo'], // 두 점 사이의 거리
  ['m3-circle', 'h1-geo'], // 원의 방정식
  ['h1-geo', 'h3-conic'],
  ['m1-solid', 'h3-space'],
  ['h1-geo', 'h3-space'],
  ['h3-space', 'h3-vec'],
  ['h1-mat', 'h3-vec'],
  // 자료와 가능성
  ['m1-data', 'm3-stat'],
  ['m3-stat', 'm3-corr'],
  ['m2-prob', 'h1-count'],
  ['h1-count', 'h2-count'],
  ['h2-count', 'h2-prob'],
  ['h2-prob', 'h2-stat'],
  ['m3-stat', 'h2-stat'],
  ['h2-int', 'h2-stat'], // 연속확률변수
]

const byId = new Map(NODES.map((x) => [x.id, x]))
export const nodeOf = (id: string) => byId.get(id)!

export const prereqsOf = (id: string) => EDGES.filter(([, b]) => b === id).map(([a]) => a)
export const nextOf = (id: string) => EDGES.filter(([a]) => a === id).map(([, b]) => b)

/** 이 단원 앞쪽(먼저 배우는 것 전부)과 뒤쪽(이어지는 것 전부) */
export function pathOf(id: string) {
  const walk = (start: string, step: (x: string) => string[]) => {
    const seen = new Set<string>()
    const stack = [start]
    while (stack.length) {
      for (const y of step(stack.pop()!)) if (!seen.has(y)) (seen.add(y), stack.push(y))
    }
    return seen
  }
  return { before: walk(id, prereqsOf), after: walk(id, nextOf) }
}
