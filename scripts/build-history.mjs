// 날짜별 "오늘의 수학사" 자료(public/history/MM.json)를 만든다.
//
// 쓰는 법: node scripts/build-history.mjs <작업 폴더>
//   <작업 폴더>/days.json : MacTutor "Mathematicians of the Day" 366일 목록 (날짜 → born[], died[], event)
//   <작업 폴더>/out/MM.json : 달마다 대표 수학자 한 명씩 우리말로 정리한 것 (date, slug, kind, year, life, name,
//                             nameKo, title, body, unit, classroom, art, event)
// 결과: public/history/01.json … 12.json (각 날짜에 그날의 수학자 전체 목록 born/died 를 붙임)
//
// 출처: MacTutor History of Mathematics (University of St Andrews), 본문 CC BY-SA 4.0.
import fs from 'node:fs'
import path from 'node:path'

const src = process.argv[2]
if (!src) {
  console.error('작업 폴더를 알려 주세요: node scripts/build-history.mjs <폴더>')
  process.exit(1)
}

const ART = fs
  .readFileSync('src/components/HistoryArt.tsx', 'utf8')
  .match(/^ {2}'?[a-z0-9-]+'?: \(/gm)
  .map((s) => s.replace(/[': (]/g, ''))
const KEYS = ['date', 'slug', 'kind', 'year', 'life', 'name', 'nameKo', 'title', 'body', 'unit', 'classroom', 'art', 'event']
const days = JSON.parse(fs.readFileSync(path.join(src, 'days.json'), 'utf8'))
const outDir = 'public/history'
fs.mkdirSync(outDir, { recursive: true })

const problems = []
const seen = new Map()
let total = 0
for (let m = 1; m <= 12; m++) {
  const mm = String(m).padStart(2, '0')
  const file = path.join(src, 'out', `${mm}.json`)
  if (!fs.existsSync(file)) {
    problems.push(`${mm}월 파일 없음`)
    continue
  }
  const entries = JSON.parse(fs.readFileSync(file, 'utf8'))
  const byDate = new Map(entries.map((e) => [e.date, e]))
  const dates = Object.keys(days).filter((d) => d.startsWith(mm + '-')).sort()
  const result = []
  for (const date of dates) {
    const e = byDate.get(date)
    if (!e) {
      problems.push(`${date} 빠짐`)
      continue
    }
    for (const k of KEYS) if (typeof e[k] !== 'string') problems.push(`${date} ${k} 없음`)
    if (!ART.includes(e.art)) problems.push(`${date} 그림 이름 ${e.art}`)
    if (!/^(중1|중2|중3|고|공통)( |$)/.test(e.unit)) problems.push(`${date} 단원 ${e.unit}`)
    if (e.kind !== 'born' && e.kind !== 'died') problems.push(`${date} kind ${e.kind}`)
    if (e.body.length < 60 || e.body.length > 300) problems.push(`${date} 본문 길이 ${e.body.length}`)
    if (/[A-Za-z]{4,}/.test(e.body.replace(/\$[^$]*\$/g, '').replace(/\([^)]*\)/g, ''))) problems.push(`${date} 본문에 영어: ${e.body.slice(0, 40)}`)
    if (seen.has(e.slug)) problems.push(`${date} ${e.slug} 가 ${seen.get(e.slug)} 에도 나옴`)
    seen.set(e.slug, date)
    const d = days[date]
    const strip = (p) => ({ year: p.year, name: p.name, slug: p.slug })
    result.push({ ...Object.fromEntries(KEYS.map((k) => [k, (e[k] ?? '').trim()])), born: d.born.map(strip), died: d.died.map(strip) })
  }
  fs.writeFileSync(path.join(outDir, `${mm}.json`), JSON.stringify(result))
  total += result.length
}

console.log(`${total}일 정리, public/history 에 저장`)
if (problems.length) {
  console.log(`확인할 것 ${problems.length}개:`)
  for (const p of problems) console.log(' - ' + p)
  process.exitCode = 1
}
