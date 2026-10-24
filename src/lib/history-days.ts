/**
 * 날짜별 "오늘의 수학사" — MacTutor History of Mathematics (St Andrews) 의 "Mathematicians of the Day" 를 바탕으로
 * 날마다 대표 수학자 한 명과 그날의 사건을 우리말로 정리한 것.
 *
 * 데이터는 public/history/MM.json (달마다 한 파일, 날짜 순 배열)에 있고 필요한 달만 불러온다.
 * MacTutor 본문은 CC BY-SA 4.0 이라, 화면에 출처와 라이선스를 늘 함께 보여 준다.
 */
export const MACTUTOR = 'https://mathshistory.st-andrews.ac.uk'
export const MACTUTOR_LICENSE = 'https://creativecommons.org/licenses/by-sa/4.0/deed.ko'

export type DayPerson = { year: string; name: string; slug: string }

export type HistoryDay = {
  /** "MM-DD" */
  date: string
  /** 대표 수학자 (MacTutor 주소 이름) */
  slug: string
  /** 이날 태어났는지, 세상을 떠났는지 */
  kind: 'born' | 'died'
  year: string
  /** "1873–1956" */
  life: string
  name: string
  nameKo: string
  title: string
  body: string
  /** 이어지는 단원 ("중2 확률", "고 미분", "공통" …) */
  unit: string
  /** 수업에서 이렇게 */
  classroom: string
  /** 삽화 이름 (components/HistoryArt.tsx) */
  art: string
  /** 이날의 사건 한 문장 (없으면 빈 문자열) */
  event: string
  /** 이날 태어난·세상을 떠난 수학자 전체 (MacTutor 목록) */
  born: DayPerson[]
  died: DayPerson[]
}

export const bioUrl = (slug: string) => `${MACTUTOR}/Biographies/${slug}/`
export const dayUrl = (mmdd: string) => `${MACTUTOR}/OfTheDay/oftheday-${mmdd}/`

const pad = (n: number) => String(n).padStart(2, '0')

/** 한국 시간 오늘 "MM-DD" */
export function kstToday(now = new Date()) {
  const k = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return `${pad(k.getUTCMonth() + 1)}-${pad(k.getUTCDate())}`
}

/** 2월 29일까지 있는 해(2024)를 기준으로 날짜를 앞뒤로 옮긴다. 12-31 다음은 01-01 */
export function shiftDay(mmdd: string, delta: number) {
  const [m, d] = mmdd.split('-').map(Number)
  const t = new Date(Date.UTC(2024, m - 1, d + delta))
  if (t.getUTCFullYear() !== 2024) t.setUTCFullYear(2024)
  return `${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`
}

/** "10월 24일" */
export function dayLabel(mmdd: string) {
  const [m, d] = mmdd.split('-').map(Number)
  return `${m}월 ${d}일`
}

/** 이 해 그 날짜의 요일까지 ("10월 24일 (토)") — 오늘 날짜를 보여 줄 때만 */
export function todayLabel(now = new Date()) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short', timeZone: 'Asia/Seoul' }).format(now)
}

const months = new Map<string, Promise<HistoryDay[]>>()

/** 한 달 치 불러오기 (같은 달은 한 번만 받는다) */
export function loadMonth(mm: string): Promise<HistoryDay[]> {
  let p = months.get(mm)
  if (!p) {
    p = fetch(`/history/${mm}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`수학사 ${mm}월 자료를 불러오지 못했어요`)
        return r.json() as Promise<HistoryDay[]>
      })
      .catch((e) => {
        months.delete(mm) // 실패하면 다음에 다시 시도
        throw e
      })
    months.set(mm, p)
  }
  return p
}

export async function loadDay(mmdd: string): Promise<HistoryDay | null> {
  const list = await loadMonth(mmdd.slice(0, 2))
  return list.find((d) => d.date === mmdd) ?? null
}

export const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

/** 찾기용: 열두 달을 모두 불러온다 */
export async function loadAll() {
  return (await Promise.all(MONTHS.map(loadMonth))).flat()
}
