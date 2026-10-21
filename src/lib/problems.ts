/**
 * 첫 화면 "오늘의 수학 문제" 은행.
 * 날짜(한국 시간)마다 한 문제씩 돌아가며 나온다. 문제를 더하려면 이 목록에 넣기만 하면 된다.
 * - body / hint / solution: 글·댓글과 같은 마크다운. $x^2$ 처럼 쓰면 수식으로 보인다.
 * - answers: 정답으로 받아 주는 표현들 (띄어쓰기·대소문자·단위는 비교할 때 지워지므로 핵심만 적는다)
 */
export type Problem = {
  id: number
  /** 짧은 이름 (게시판 글 제목 등에 씀) */
  title: string
  level: '중1' | '중2' | '중3' | '고' | '공통'
  unit: string
  body: string
  answers: string[]
  hint: string
  solution: string
}

export const PROBLEMS: Problem[] = [
  {
    id: 1,
    title: '3의 배수도 5의 배수도 아닌 수',
    level: '중1',
    unit: '소인수분해·배수',
    body: '1부터 100까지의 자연수 가운데 **3의 배수도 아니고 5의 배수도 아닌** 수는 모두 몇 개일까요?',
    answers: ['53'],
    hint: '3의 배수, 5의 배수를 각각 세고, 둘 다인 15의 배수는 두 번 세어졌으니 한 번 돌려주세요.',
    solution:
      '3의 배수 33개, 5의 배수 20개, 15의 배수 6개이므로 3 또는 5의 배수는 $33+20-6=47$개.\n따라서 둘 다 아닌 수는 $100-47=53$개예요.',
  },
  {
    id: 2,
    title: '주사위 두 개, 합이 7',
    level: '중2',
    unit: '확률',
    body: '서로 다른 주사위 두 개를 동시에 던질 때, 나온 눈의 **합이 7**이 될 확률은?',
    answers: ['1/6', '6/36'],
    hint: '모든 경우는 $6\\times6=36$가지. 합이 7이 되는 순서쌍을 모두 적어 보세요.',
    solution: '$(1,6),(2,5),(3,4),(4,3),(5,2),(6,1)$의 6가지이므로 $\\dfrac{6}{36}=\\dfrac{1}{6}$.',
  },
  {
    id: 3,
    title: '빗변이 13인 직각삼각형',
    level: '중2',
    unit: '피타고라스 정리',
    body: '빗변의 길이가 13, 한 변의 길이가 5인 직각삼각형이 있어요. **나머지 한 변**의 길이는?',
    answers: ['12'],
    hint: '$a^2+b^2=c^2$ 에서 $c=13$, $a=5$.',
    solution: '$b^2=13^2-5^2=169-25=144$ 이므로 $b=12$. (5, 12, 13)은 대표적인 피타고라스 수예요.',
  },
  {
    id: 4,
    title: '홀수의 합',
    level: '고',
    unit: '수열',
    body: '$1+3+5+\\cdots+99$ 의 값은?',
    answers: ['2500'],
    hint: '처음 $n$개 홀수의 합은 $n^2$. 99는 몇 번째 홀수일까요?',
    solution: '99는 50번째 홀수이므로 합은 $50^2=2500$. 등차수열의 합 $\\dfrac{50(1+99)}{2}$ 로 구해도 같아요.',
  },
  {
    id: 5,
    title: '나머지가 같은 수',
    level: '중1',
    unit: '최소공배수',
    body: '7로 나누어도 11로 나누어도 **나머지가 3**인 가장 작은 두 자리 자연수는?',
    answers: ['80'],
    hint: '7과 11의 공배수에 3을 더한 수를 생각해 보세요.',
    solution: '7과 11의 최소공배수는 77. 조건을 만족하는 수는 $77k+3$ 꼴이고, 두 자리 중 가장 작은 것은 $77+3=80$.',
  },
  {
    id: 6,
    title: '두 점을 지나는 직선',
    level: '중2',
    unit: '일차함수',
    body: '두 점 $(1,\\,2)$, $(3,\\,8)$ 을 지나는 직선의 **기울기**는?',
    answers: ['3'],
    hint: '기울기 $=\\dfrac{y\\text{의 증가량}}{x\\text{의 증가량}}$',
    solution: '$\\dfrac{8-2}{3-1}=\\dfrac{6}{2}=3$.',
  },
  {
    id: 7,
    title: '인수분해 뒤 제곱의 합',
    level: '중3',
    unit: '인수분해',
    body: '$x^2-5x+6=(x-a)(x-b)$ 일 때, $a^2+b^2$ 의 값은?',
    answers: ['13'],
    hint: '합이 5, 곱이 6인 두 수를 찾아보세요.',
    solution: '$x^2-5x+6=(x-2)(x-3)$ 이므로 $a^2+b^2=4+9=13$. ($(a+b)^2-2ab=25-12=13$ 으로 구할 수도 있어요.)',
  },
  {
    id: 8,
    title: '적어도 한 번은 앞면',
    level: '고',
    unit: '확률',
    body: '동전 3개를 동시에 던질 때, **앞면이 적어도 한 개** 나올 확률은?',
    answers: ['7/8', '0.875'],
    hint: '"적어도 하나"는 여사건으로! 모두 뒷면일 확률을 1에서 빼 보세요.',
    solution: '모두 뒷면일 확률은 $\\left(\\dfrac12\\right)^3=\\dfrac18$. 따라서 $1-\\dfrac18=\\dfrac78$.',
  },
  {
    id: 9,
    title: '로그 두 개의 합',
    level: '고',
    unit: '지수함수와 로그함수',
    body: '$\\log_2 8+\\log_3 81$ 의 값은?',
    answers: ['7'],
    hint: '$8=2^3$, $81=3^4$.',
    solution: '$\\log_2 2^3+\\log_3 3^4=3+4=7$.',
  },
  {
    id: 10,
    title: '특수각의 삼각비',
    level: '중3',
    unit: '삼각비',
    body: '$\\sin 30^\\circ+\\cos 60^\\circ+\\tan 45^\\circ$ 의 값은?',
    answers: ['2'],
    hint: '세 값 모두 외우고 있는 특수각이에요.',
    solution: '$\\dfrac12+\\dfrac12+1=2$.',
  },
  {
    id: 11,
    title: '극솟값 찾기',
    level: '고',
    unit: '미분',
    body: '함수 $f(x)=x^3-3x$ 의 **극솟값**은?',
    answers: ['-2'],
    hint: "$f'(x)=3x^2-3=0$ 이 되는 $x$ 를 찾고, 증가·감소를 살펴보세요.",
    solution: "$f'(x)=3(x-1)(x+1)$. $x=1$ 에서 감소→증가로 바뀌므로 극소, $f(1)=1-3=-2$.",
  },
  {
    id: 12,
    title: '간단한 정적분',
    level: '고',
    unit: '적분',
    body: '$\\displaystyle\\int_0^1 3x^2\\,dx$ 의 값은?',
    answers: ['1'],
    hint: '$3x^2$ 의 부정적분은 $x^3$.',
    solution: '$\\left[x^3\\right]_0^1=1-0=1$.',
  },
  {
    id: 13,
    title: '정십이각형의 한 내각',
    level: '중1',
    unit: '평면도형',
    body: '정십이각형의 **한 내각**의 크기는 몇 도일까요?',
    answers: ['150'],
    hint: '$n$각형 내각의 합은 $180^\\circ\\times(n-2)$.',
    solution: '$\\dfrac{180^\\circ\\times10}{12}=150^\\circ$. 한 외각이 $360^\\circ\\div12=30^\\circ$ 임을 이용해도 좋아요.',
  },
  {
    id: 14,
    title: '정사각형의 대각선',
    level: '중3',
    unit: '제곱근과 실수',
    body: '한 변의 길이가 1인 정사각형의 **대각선**의 길이는?',
    answers: ['√2', '2^1/2', '2^0.5'],
    hint: '대각선을 빗변으로 하는 직각삼각형을 떠올려 보세요.',
    solution: '$\\sqrt{1^2+1^2}=\\sqrt2$. 이 수가 유리수가 아님을 보이는 것이 피타고라스 학파의 유명한 이야기죠.',
  },
  {
    id: 15,
    title: '등차수열의 제20항',
    level: '고',
    unit: '수열',
    body: '등차수열 $2,\\,5,\\,8,\\,11,\\,\\ldots$ 의 **제20항**은?',
    answers: ['59'],
    hint: '$a_n=a_1+(n-1)d$',
    solution: '$a_{20}=2+19\\times3=59$.',
  },
  {
    id: 16,
    title: '등비수열의 합',
    level: '고',
    unit: '수열',
    body: '등비수열 $3,\\,6,\\,12,\\,24,\\,\\ldots$ 의 **첫째항부터 제8항까지의 합**은?',
    answers: ['765'],
    hint: '$S_n=\\dfrac{a(r^n-1)}{r-1}$',
    solution: '$S_8=\\dfrac{3(2^8-1)}{2-1}=3\\times255=765$.',
  },
  {
    id: 17,
    title: '연립방정식',
    level: '중2',
    unit: '연립일차방정식',
    body: '연립방정식 $\\begin{cases}x+y=10\\\\x-y=4\\end{cases}$ 의 해에서 $x$ 의 값은?',
    answers: ['7'],
    hint: '두 식을 더하면 $y$ 가 사라져요.',
    solution: '두 식을 더하면 $2x=14$, $x=7$ (그리고 $y=3$).',
  },
  {
    id: 18,
    title: '1을 포함하는 부분집합',
    level: '고',
    unit: '집합과 명제',
    body: '집합 $A=\\{1,2,3,4,5,6\\}$ 의 부분집합 가운데 **원소 1을 포함하는** 것은 몇 개일까요?',
    answers: ['32'],
    hint: '1은 반드시 들어가고, 나머지 5개 원소는 각각 넣거나 말거나.',
    solution: '$2^5=32$개. (전체 부분집합 $2^6=64$개의 절반이기도 해요.)',
  },
  {
    id: 19,
    title: '회장과 부회장',
    level: '고',
    unit: '경우의 수',
    body: '5명 가운데 회장 1명과 부회장 1명을 뽑는 경우의 수는?',
    answers: ['20'],
    hint: '회장을 먼저 뽑고, 남은 사람 중에서 부회장을 뽑아요. 순서가 중요해요.',
    solution: '$_5P_2=5\\times4=20$.',
  },
  {
    id: 20,
    title: 'SHREK 글자 배열',
    level: '고',
    unit: '순열',
    body: 'S, H, R, E, K 다섯 글자를 모두 사용하여 일렬로 배열하는 방법은 몇 가지일까요?',
    answers: ['120'],
    hint: '다섯 글자가 모두 달라요.',
    solution: '$5!=5\\times4\\times3\\times2\\times1=120$가지.',
  },
  {
    id: 21,
    title: '분수의 합, 망원경처럼',
    level: '중1',
    unit: '유리수의 계산',
    body: '$\\dfrac12+\\dfrac16+\\dfrac1{12}+\\dfrac1{20}$ 의 값은?',
    answers: ['4/5', '0.8'],
    hint: '$\\dfrac{1}{n(n+1)}=\\dfrac1n-\\dfrac1{n+1}$ 임을 이용해 보세요.',
    solution:
      '$\\left(1-\\dfrac12\\right)+\\left(\\dfrac12-\\dfrac13\\right)+\\left(\\dfrac13-\\dfrac14\\right)+\\left(\\dfrac14-\\dfrac15\\right)=1-\\dfrac15=\\dfrac45$.',
  },
  {
    id: 22,
    title: '꼭짓점의 y좌표',
    level: '중3',
    unit: '이차함수',
    body: '이차함수 $y=x^2-4x+1$ 의 그래프의 **꼭짓점의 $y$좌표**는?',
    answers: ['-3'],
    hint: '완전제곱식으로 바꿔 보세요.',
    solution: '$y=(x-2)^2-3$ 이므로 꼭짓점은 $(2,\\,-3)$. 답은 $-3$.',
  },
  {
    id: 23,
    title: 'i의 2026제곱',
    level: '고',
    unit: '복소수',
    body: '$i^{2026}$ 의 값은? (단, $i=\\sqrt{-1}$)',
    answers: ['-1'],
    hint: '$i^1=i,\\ i^2=-1,\\ i^3=-i,\\ i^4=1$ 이 반복돼요. 2026을 4로 나눈 나머지는?',
    solution: '$2026=4\\times506+2$ 이므로 $i^{2026}=i^2=-1$.',
  },
  {
    id: 24,
    title: '소수를 뽑을 확률',
    level: '고',
    unit: '확률',
    body: '1부터 20까지 적힌 카드 20장 중 한 장을 뽑을 때, **소수**가 적힌 카드를 뽑을 확률은?',
    answers: ['2/5', '8/20', '0.4'],
    hint: '20 이하의 소수를 모두 적어 보세요.',
    solution: '소수는 2, 3, 5, 7, 11, 13, 17, 19의 8개이므로 $\\dfrac{8}{20}=\\dfrac25$.',
  },
  {
    id: 25,
    title: '닮은 삼각형의 넓이비',
    level: '중2',
    unit: '도형의 닮음',
    body: '닮음비가 $2:3$ 인 두 삼각형의 **넓이의 비**는? (예: 1:2 처럼 답해 주세요)',
    answers: ['4:9'],
    hint: '넓이는 길이의 제곱에 비례해요.',
    solution: '$2^2:3^2=4:9$.',
  },
  {
    id: 26,
    title: '접선의 기울기',
    level: '고',
    unit: '미분',
    body: '곡선 $y=x^2$ 위의 점 $(3,\\,9)$ 에서의 **접선의 기울기**는?',
    answers: ['6'],
    hint: '접선의 기울기는 그 점에서의 미분계수.',
    solution: "$y'=2x$ 이므로 $x=3$ 에서 $2\\times3=6$.",
  },
  {
    id: 27,
    title: '360의 약수의 개수',
    level: '중1',
    unit: '소인수분해',
    body: '360의 **약수**는 모두 몇 개일까요?',
    answers: ['24'],
    hint: '$360=2^3\\times3^2\\times5$. 지수에 1씩 더해 곱해 보세요.',
    solution: '$(3+1)(2+1)(1+1)=4\\times3\\times2=24$개.',
  },
  {
    id: 28,
    title: '지수방정식',
    level: '고',
    unit: '지수함수와 로그함수',
    body: '$4^x=8$ 을 만족하는 $x$ 의 값은?',
    answers: ['3/2', '1.5'],
    hint: '밑을 2로 통일해 보세요.',
    solution: '$2^{2x}=2^3$ 이므로 $2x=3$, $x=\\dfrac32$.',
  },
  {
    id: 29,
    title: '자료의 분산',
    level: '고',
    unit: '통계',
    body: '다섯 개의 자료 $3,\\,7,\\,7,\\,8,\\,10$ 의 **분산**은?',
    answers: ['5.2', '26/5'],
    hint: '평균은 7. 편차의 제곱의 평균을 구해요.',
    solution: '편차는 $-4,0,0,1,3$ 이고 제곱의 합은 $16+0+0+1+9=26$. 분산은 $\\dfrac{26}{5}=5.2$.',
  },
  {
    id: 30,
    title: '두 점 사이의 거리',
    level: '고',
    unit: '도형의 방정식',
    body: '두 점 $A(1,\\,2)$, $B(4,\\,6)$ 사이의 거리는?',
    answers: ['5'],
    hint: '$\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$',
    solution: '$\\sqrt{3^2+4^2}=\\sqrt{25}=5$. (3, 4, 5) 직각삼각형이 숨어 있었네요.',
  },
  {
    id: 31,
    title: '3시 30분의 시곗바늘',
    level: '중1',
    unit: '각',
    body: '3시 30분에 시침과 분침이 이루는 **작은 쪽의 각**은 몇 도일까요?',
    answers: ['75'],
    hint: '분침은 1분에 $6^\\circ$, 시침은 1분에 $0.5^\\circ$ 움직여요.',
    solution: '분침은 $180^\\circ$, 시침은 $3\\times30^\\circ+30\\times0.5^\\circ=105^\\circ$ 자리. 차는 $75^\\circ$.',
  },
  {
    id: 32,
    title: '수열의 극한',
    level: '고',
    unit: '수열의 극한',
    body: '$\\displaystyle\\lim_{n\\to\\infty}\\frac{3n+1}{n+2}$ 의 값은?',
    answers: ['3'],
    hint: '분모·분자를 $n$ 으로 나눠 보세요.',
    solution: '$\\dfrac{3+\\frac1n}{1+\\frac2n}\\to\\dfrac{3+0}{1+0}=3$.',
  },
  {
    id: 33,
    title: '자리를 바꾸면 27 커지는 수',
    level: '중2',
    unit: '연립일차방정식',
    body: '어떤 두 자리 자연수는 각 자리 숫자의 합이 9이고, 십의 자리와 일의 자리 숫자를 바꾸면 처음 수보다 27만큼 커져요. **처음 수**는?',
    answers: ['36'],
    hint: '십의 자리를 $a$, 일의 자리를 $b$ 라 하면 처음 수는 $10a+b$.',
    solution: '$a+b=9$, $(10b+a)-(10a+b)=9(b-a)=27$ 에서 $b-a=3$. 따라서 $a=3$, $b=6$, 처음 수는 36.',
  },
  {
    id: 34,
    title: '원 안의 현의 길이',
    level: '중3',
    unit: '원의 성질',
    body: '반지름이 5인 원에서, 중심으로부터 거리가 3인 **현의 길이**는?',
    answers: ['8'],
    hint: '중심에서 현에 내린 수선은 현을 이등분해요.',
    solution: '현의 절반은 $\\sqrt{5^2-3^2}=4$ 이므로 현의 길이는 8.',
  },
  {
    id: 35,
    title: '방정식 sin x = 1/2',
    level: '고',
    unit: '삼각함수',
    body: '$0\\le x<2\\pi$ 에서 방정식 $\\sin x=\\dfrac12$ 의 **해의 개수**는?',
    answers: ['2'],
    hint: '단위원에서 $y$좌표가 $\\frac12$ 인 점을 찾아보세요.',
    solution: '$x=\\dfrac{\\pi}{6},\\ \\dfrac{5\\pi}{6}$ 의 2개.',
  },
  {
    id: 36,
    title: '동전 4개, 앞면 딱 2개',
    level: '중2',
    unit: '경우의 수',
    body: '서로 다른 동전 4개를 던질 때, **앞면이 정확히 2개** 나오는 경우의 수는?',
    answers: ['6'],
    hint: '4개 중 앞면이 될 2개를 고르면 돼요.',
    solution: '$_4C_2=\\dfrac{4\\times3}{2}=6$가지.',
  },
  {
    id: 37,
    title: '다음 수는?',
    level: '공통',
    unit: '규칙 찾기',
    body: '$1,\\,1,\\,2,\\,3,\\,5,\\,8,\\,13,\\,\\square$ — 빈칸에 들어갈 수는?',
    answers: ['21'],
    hint: '앞의 두 수를 더해 보세요.',
    solution: '$8+13=21$. 피보나치 수열이에요. 해바라기 씨앗, 솔방울에서도 이 수들이 나타나요.',
  },
  {
    id: 38,
    title: '100 이하의 소수',
    level: '공통',
    unit: '소수',
    body: '100 이하의 **소수**는 모두 몇 개일까요?',
    answers: ['25'],
    hint: '에라토스테네스의 체로 2, 3, 5, 7의 배수를 지워 보세요.',
    solution: '2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97 — 25개.',
  },
  {
    id: 39,
    title: '어떤 수일까',
    level: '중1',
    unit: '일차방정식',
    body: '어떤 수의 3배에서 5를 뺀 값은, 그 수에 7을 더한 값과 같아요. **어떤 수**는?',
    answers: ['6'],
    hint: '어떤 수를 $x$ 라 하고 식을 세워 보세요.',
    solution: '$3x-5=x+7$ 에서 $2x=12$, $x=6$.',
  },
  {
    id: 40,
    title: '직각삼각형의 외접원',
    level: '중3',
    unit: '원의 성질',
    body: '세 변의 길이가 6, 8, 10인 삼각형의 **외접원의 반지름**은?',
    answers: ['5'],
    hint: '$6^2+8^2=10^2$. 이 삼각형은 어떤 삼각형일까요?',
    solution: '직각삼각형의 외접원의 중심은 빗변의 중점이므로 반지름은 빗변의 절반, $10\\div2=5$.',
  },
  {
    id: 41,
    title: '1부터 10까지의 곱, 0의 개수',
    level: '공통',
    unit: '소인수분해',
    body: '$10!=1\\times2\\times\\cdots\\times10$ 을 계산하면 끝에 **0이 몇 개** 붙을까요?',
    answers: ['2'],
    hint: '0 하나는 $2\\times5$ 에서 나와요. 5가 몇 번 곱해지는지 세어 보세요.',
    solution: '1~10 중 5의 배수는 5, 10의 두 개 (2는 넉넉해요). 그래서 $10!=3628800$, 0이 2개.',
  },
  {
    id: 42,
    title: '두 직선이 수직',
    level: '고',
    unit: '도형의 방정식',
    body: '직선 $y=2x+1$ 에 **수직**인 직선의 기울기는?',
    answers: ['-1/2', '-0.5'],
    hint: '두 직선이 수직이면 기울기의 곱이 $-1$.',
    solution: '$2\\times m=-1$ 이므로 $m=-\\dfrac12$.',
  },
]

/** 답 비교용 정리: 띄어쓰기·대소문자·단위·"x=" 같은 꾸밈을 지운다 */
export function normalizeAnswer(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[\s,]/g, '')
    .replace(/^(x|y|n|m|답|정답)[=:]/, '')
    .replace(/[−–]/g, '-')
    .replace(/루트|sqrt|root/g, '√')
    .replace(/[()]/g, '')
    .replace(/(개|명|가지|cm|m|도|°)$/, '')
    .replace(/^\+/, '')
    .replace(/^(-?\d+)\.0+$/, '$1')
    .replace(/\.$/, '')
}

export function isCorrect(p: Problem, input: string) {
  const v = normalizeAnswer(input)
  return v.length > 0 && p.answers.some((a) => normalizeAnswer(a) === v)
}

/** 오늘(한국 시간) 날짜의 일련번호 — 날마다 1씩 커진다 */
export function kstDayNumber(now = new Date()) {
  return Math.floor((now.getTime() + 9 * 60 * 60 * 1000) / 86_400_000)
}

/** 오늘의 문제 (날마다 바뀌고, 모든 문제가 한 번씩 돌면 처음부터) */
export function problemOfDay(now = new Date()) {
  return PROBLEMS[kstDayNumber(now) % PROBLEMS.length]
}

/** 오늘의 문제가 아닌 문제 하나를 무작위로 */
export function randomProblem(exceptId?: number) {
  const pool = PROBLEMS.filter((p) => p.id !== exceptId)
  return pool[Math.floor(Math.random() * pool.length)]
}
