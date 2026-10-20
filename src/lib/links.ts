/** 수학 선생님에게 자주 쓰이는 사이트 모음 (링크 모음 화면) */
export type HubLink = { name: string; url: string; desc: string }

export const LINK_GROUPS: { title: string; icon: string; links: HubLink[] }[] = [
  {
    title: '교육과정 · 평가',
    icon: '📘',
    links: [
      { name: '국가교육과정정보센터(NCIC)', url: 'https://ncic.re.kr', desc: '2022 개정 교육과정 원문·해설서' },
      { name: '한국교육과정평가원', url: 'https://www.kice.re.kr', desc: '평가 연구, 학업성취도 평가' },
      { name: '대학수학능력시험', url: 'https://www.suneung.re.kr', desc: '수능·모의평가 기출 문제와 정답' },
      { name: '에듀넷·티-클리어', url: 'https://www.edunet.net', desc: '교수학습 자료, 교과서 자료' },
    ],
  },
  {
    title: '수업 도구',
    icon: '🧮',
    links: [
      { name: 'GeoGebra', url: 'https://www.geogebra.org', desc: '함수·도형·확률 동적 수학 도구' },
      { name: '알지오매스(AlgeoMath)', url: 'https://www.algeomath.kr', desc: '한국형 동적 기하·블록코딩 수학 도구' },
      { name: 'Desmos', url: 'https://www.desmos.com', desc: '그래프 계산기, 수업 활동' },
      { name: 'Wolfram|Alpha', url: 'https://www.wolframalpha.com', desc: '계산·풀이 확인' },
      { name: 'Overleaf', url: 'https://www.overleaf.com', desc: '온라인 LaTeX 문서 작성' },
    ],
  },
  {
    title: '학생 학습 · 영상',
    icon: '🎬',
    links: [
      { name: 'EBSi', url: 'https://www.ebsi.co.kr', desc: '고등 강의·교재' },
      { name: 'EBS 수학', url: 'https://www.ebsmath.co.kr', desc: '수준별 수학 학습' },
      { name: '칸아카데미', url: 'https://ko.khanacademy.org', desc: '무료 수학 강의·연습' },
    ],
  },
  {
    title: '수학 문화 · 읽을거리',
    icon: '🏫',
    links: [
      { name: '대한수학회', url: 'https://www.kms.or.kr', desc: '수학 학회, 수학 대중화 활동' },
      { name: '동아사이언스(수학동아)', url: 'https://www.dongascience.com', desc: '수학·과학 기사, 수업 읽기 자료' },
      { name: '사이언스올', url: 'https://www.scienceall.com', desc: '과학·수학 교육 콘텐츠' },
    ],
  },
]
