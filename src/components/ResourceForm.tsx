'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { RESOURCE_TYPES, SUBJECTS, UNIT_HINTS, subjectsOf } from '@/lib/curriculum'
import { ACCEPT, MAX_FILES, checkFile, removeFiles, uploadFile } from '@/lib/files'
import { fileSize, koError } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { FileInfo, Resource, SchoolLevel } from '@/lib/types'
import { useAuth } from './AuthProvider'
import { MarkdownEditor } from './MarkdownEditor'
import { ErrorBox } from './ui'

/** 자료 올리기 / 고치기 */
export function ResourceForm({ initial }: { initial?: Resource }) {
  const { session, profile } = useAuth()
  const router = useRouter()
  const defaultLevel: SchoolLevel = initial?.school_level ?? (profile?.school_level === '중' ? '중' : '고')

  const [title, setTitle] = useState(initial?.title ?? '')
  const [level, setLevel] = useState<SchoolLevel>(defaultLevel)
  const [subject, setSubject] = useState(initial?.subject ?? subjectsOf(defaultLevel)[0])
  const [unit, setUnit] = useState(initial?.unit ?? '')
  const [type, setType] = useState(initial?.resource_type ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [link, setLink] = useState(initial?.link_url ?? '')
  const [kept, setKept] = useState<FileInfo[]>(initial?.files ?? [])
  const [added, setAdded] = useState<File[]>([])
  const [agreeCopyright, setAgreeCopyright] = useState(!!initial)
  const [agreePrivacy, setAgreePrivacy] = useState(!!initial)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')

  const fileCount = kept.length + added.length

  function changeLevel(l: SchoolLevel) {
    setLevel(l)
    if (!subjectsOf(l).includes(subject)) setSubject(subjectsOf(l)[0])
  }

  function addFiles(list: FileList | null) {
    if (!list) return
    const files = Array.from(list)
    const problems = files.map(checkFile).filter(Boolean)
    const ok = files.filter((f) => !checkFile(f))
    const room = MAX_FILES - fileCount
    if (ok.length > room) problems.push(`파일은 ${MAX_FILES}개까지 올릴 수 있어요.`)
    setAdded((a) => [...a, ...ok.slice(0, Math.max(0, room))])
    setError(problems.join('\n'))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const uid = session?.user.id
    if (!uid) return
    if (!title.trim()) return setError('제목을 넣어 주세요.')
    if (!type) return setError('자료 유형을 골라 주세요.')
    const url = link.trim()
    if (url && !/^https?:\/\/\S+$/i.test(url)) return setError('링크는 https:// 로 시작하는 주소로 넣어 주세요.')
    if (fileCount === 0 && !url) return setError('파일이나 링크 중 하나는 꼭 넣어 주세요.')
    if (!agreeCopyright || !agreePrivacy) return setError('아래 두 가지 확인에 체크해 주세요.')

    const uploaded: FileInfo[] = []
    try {
      for (const [i, f] of added.entries()) {
        setProgress(`파일 올리는 중 (${i + 1}/${added.length}) ${f.name}`)
        uploaded.push(await uploadFile(uid, f))
      }
      setProgress('저장하는 중…')
      const row = {
        title: title.trim(),
        school_level: level,
        subject,
        unit: unit.trim(),
        resource_type: type,
        description: description.trim(),
        link_url: url || null,
        files: [...kept, ...uploaded],
      }
      const { data, error } = initial
        ? await supabase.from('resources').update(row).eq('id', initial.id).select('id').single()
        : await supabase.from('resources').insert(row).select('id').single()
      if (error) throw error

      // 고칠 때 빼 버린 파일은 저장소에서도 지운다
      if (initial) {
        const keptPaths = new Set(kept.map((f) => f.path))
        await removeFiles(initial.files.filter((f) => !keptPaths.has(f.path)).map((f) => f.path))
      }
      router.push(`/resources/${data.id}`)
    } catch (err) {
      await removeFiles(uploaded.map((f) => f.path))
      setError(koError(err))
      setProgress('')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className="label" htmlFor="title">
          제목 <Req />
        </label>
        <input
          id="title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="예) 이차함수 그래프 평행이동 활동지 (GeoGebra 포함)"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <span className="label">
            학교급 <Req />
          </span>
          <div className="flex gap-2">
            {(['중', '고'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => changeLevel(l)}
                className={`chip flex-1 justify-center py-2 ${level === l ? 'chip-on' : ''}`}
              >
                {l === '중' ? '중학교' : '고등학교'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="subject">
            과목 <Req />
          </label>
          <select id="subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {SUBJECTS[level].map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="unit">
            단원
          </label>
          <input
            id="unit"
            className="input"
            list="unit-hints"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            maxLength={60}
            placeholder="골라도, 직접 써도 돼요"
          />
          <datalist id="unit-hints">
            {(UNIT_HINTS[subject] ?? []).map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <span className="label">
          자료 유형 <Req />
        </span>
        <div className="flex flex-wrap gap-2">
          {RESOURCE_TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setType(t)} className={`chip ${type === t ? 'chip-on' : ''}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="desc">
          설명
        </label>
        <MarkdownEditor
          id="desc"
          value={description}
          onChange={setDescription}
          rows={8}
          placeholder={'어떤 수업에서 어떻게 썼는지, 학생 반응은 어땠는지 알려 주시면 큰 도움이 돼요.\n수식은 $y=a(x-p)^2+q$ 처럼 쓰면 돼요.'}
        />
      </div>

      <div>
        <span className="label">파일</span>
        <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500 hover:border-brand-400 hover:bg-brand-50/40">
          <span className="font-semibold text-slate-700">여기를 눌러 파일 고르기</span>
          <span className="text-xs">HWP · PDF · PPT · 한셀/엑셀 · GeoGebra · 이미지 · ZIP 등, 한 파일 50MB, 최대 {MAX_FILES}개</span>
          <input
            type="file"
            multiple
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </label>
        {fileCount > 0 && (
          <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white text-sm">
            {kept.map((f) => (
              <FileRow key={f.path} name={f.name} size={f.size} onRemove={() => setKept((k) => k.filter((x) => x !== f))} />
            ))}
            {added.map((f, i) => (
              <FileRow
                key={`${f.name}-${i}`}
                name={f.name}
                size={f.size}
                isNew
                onRemove={() => setAdded((a) => a.filter((x) => x !== f))}
              />
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="label" htmlFor="link">
          링크 <span className="font-normal text-slate-400">(GeoGebra · Desmos · 유튜브 · 패들렛 등)</span>
        </label>
        <input
          id="link"
          className="input"
          type="url"
          inputMode="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          maxLength={500}
          placeholder="https://www.geogebra.org/m/..."
        />
      </div>

      <fieldset className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <legend className="sr-only">올리기 전 확인</legend>
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-0.5 accent-brand-600" checked={agreeCopyright} onChange={(e) => setAgreeCopyright(e.target.checked)} />
          <span>
            직접 만들었거나 공유가 허락된 자료예요. 교과서·시중 문제집을 스캔하거나 그대로 옮긴 자료가 아니에요.
          </span>
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-0.5 accent-brand-600" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} />
          <span>학생 이름·학번·성적 같은 개인정보가 들어 있지 않아요.</span>
        </label>
        <p className="text-xs text-amber-700">
          자세한 내용은{' '}
          <Link href="/rules" target="_blank" className="underline">
            이용 규칙
          </Link>
          을 봐 주세요.
        </p>
      </fieldset>

      <ErrorBox>{error && <span className="whitespace-pre-line">{error}</span>}</ErrorBox>

      <div className="flex items-center justify-end gap-3">
        {progress && <span className="text-sm text-slate-500">{progress}</span>}
        <button type="button" className="btn-ghost" onClick={() => router.back()} disabled={!!progress}>
          취소
        </button>
        <button className="btn-primary" disabled={!!progress}>
          {initial ? '고친 내용 저장' : '자료 올리기'}
        </button>
      </div>
    </form>
  )
}

function FileRow(props: { name: string; size: number; isNew?: boolean; onRemove: () => void }) {
  return (
    <li className="flex items-center gap-3 px-3 py-2">
      <span className="min-w-0 flex-1 truncate">{props.name}</span>
      {props.isNew && <span className="badge-brand">새 파일</span>}
      <span className="text-xs text-slate-400">{fileSize(props.size)}</span>
      <button type="button" onClick={props.onRemove} className="text-xs text-slate-400 hover:text-red-500">
        빼기
      </button>
    </li>
  )
}

function Req() {
  return <span className="text-red-500">*</span>
}
