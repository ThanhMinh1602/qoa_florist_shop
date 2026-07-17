import { useEffect, useRef, useState } from 'react'
import { countBracketPhrases } from '../../../constants/topicQrForms'
import { MUSIC_TRACKS } from '../../../constants/galaxyMusic'
import MaterialIcon from '../../../components/common/MaterialIcon'

const fieldClassName =
  'w-full rounded-xl border border-rose-100 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-2 focus:ring-rose-100'

/** Chọn nhạc nền + nghe thử trước khi lưu */
function MusicField({ field, values, onChange }) {
  const audioRef = useRef(null)
  const [playingId, setPlayingId] = useState(null)
  const selectedId = String(values[field.name] ?? '')

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  function stopPreview() {
    audioRef.current?.pause()
    setPlayingId(null)
  }

  function togglePreview(track) {
    if (playingId === track.id) {
      stopPreview()
      return
    }
    if (!audioRef.current) audioRef.current = new Audio()
    audioRef.current.src = track.url
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
    setPlayingId(track.id)
    audioRef.current.onended = () => setPlayingId(null)
  }

  return (
    <div className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {field.label}
        {field.required ? <span className="text-rose-500"> *</span> : null}
      </span>

      {MUSIC_TRACKS.length === 0 ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Chưa có bài nhạc nào trong thư mục assets/audios.
        </p>
      ) : (
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-rose-100 px-4 py-2.5 text-sm transition hover:bg-rose-50/60">
            <input
              type="radio"
              name={`music-${field.name}`}
              checked={!selectedId}
              onChange={() => {
                stopPreview()
                onChange(field.name, '')
              }}
              className="h-4 w-4 accent-rose-500"
            />
            <span className="text-slate-600">Không có nhạc</span>
          </label>

          {MUSIC_TRACKS.map((track) => {
            const active = selectedId === track.id
            const isPlaying = playingId === track.id
            return (
              <div
                key={track.id}
                className={[
                  'flex items-center gap-2 rounded-xl border px-3 py-2 transition',
                  active
                    ? 'border-rose-300 bg-rose-50 ring-1 ring-rose-100'
                    : 'border-rose-100 hover:bg-rose-50/60',
                ].join(' ')}
              >
                <label className="flex flex-1 cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="radio"
                    name={`music-${field.name}`}
                    checked={active}
                    onChange={() => onChange(field.name, track.id)}
                    className="h-4 w-4 accent-rose-500"
                  />
                  <span className="font-medium text-slate-800">{track.name}</span>
                </label>
                <button
                  type="button"
                  onClick={() => togglePreview(track)}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                >
                  <MaterialIcon name={isPlaying ? 'stop' : 'play_arrow'} className="text-base" />
                  {isPlaying ? 'Dừng' : 'Nghe thử'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {field.help ? <span className="mt-1.5 block text-xs text-slate-400">{field.help}</span> : null}
    </div>
  )
}

/** Nhập cụm từ dạng [cụm 1][cụm 2] — nút thêm tạo cặp [] và đặt cursor vào giữa */
function PhraseListField({ field, values, onChange }) {
  const inputRef = useRef(null)
  const maxItems = field.maxItems || 6
  const raw = String(values[field.name] ?? '')
  const phraseCount = countBracketPhrases(raw)

  function insertNewBracketPair() {
    if (phraseCount >= maxItems) return
    const el = inputRef.current
    const next = `${raw}[]`
    onChange(field.name, next)

    requestAnimationFrame(() => {
      if (!el) return
      const cursor = next.length - 1
      el.focus()
      el.setSelectionRange(cursor, cursor)
    })
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    insertNewBracketPair()
  }

  return (
    <div className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {field.label}
        {field.required ? <span className="text-rose-500"> *</span> : null}
      </span>
      <textarea
        ref={inputRef}
        value={raw}
        onChange={(event) => onChange(field.name, event.target.value)}
        onKeyDown={handleKeyDown}
        className={[fieldClassName, 'min-h-24 resize-y font-mono leading-6'].join(' ')}
        placeholder={field.placeholder}
        required={field.required}
        spellCheck={false}
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {phraseCount < maxItems ? (
          <button
            type="button"
            onClick={insertNewBracketPair}
            className="text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            + Thêm cụm từ ({phraseCount}/{maxItems})
          </button>
        ) : (
          <span className="text-xs text-slate-400">Đã đạt tối đa {maxItems} cụm từ.</span>
        )}
      </div>
      {field.help ? <span className="mt-1.5 block text-xs text-slate-400">{field.help}</span> : null}
    </div>
  )
}

/** Form động theo schema TOPIC_QR_FORMS */
function TopicQrForm({ fields, values, onChange }) {
  return (
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
      {fields.map((field) => {
        if (field.type === 'phraseList') {
          return <PhraseListField key={field.name} field={field} values={values} onChange={onChange} />
        }

        if (field.type === 'music') {
          return <MusicField key={field.name} field={field} values={values} onChange={onChange} />
        }

        const isTextarea = field.type === 'textarea'
        const InputTag = isTextarea ? 'textarea' : 'input'

        return (
          <label key={field.name} className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              {field.label}
              {field.required ? <span className="text-rose-500"> *</span> : null}
            </span>
            <InputTag
              type={isTextarea ? undefined : field.type || 'text'}
              value={values[field.name] ?? ''}
              onChange={(event) => onChange(field.name, event.target.value)}
              className={[fieldClassName, isTextarea ? 'min-h-32 resize-y leading-6' : ''].join(' ')}
              placeholder={field.placeholder}
              required={field.required}
              autoComplete={field.type === 'tel' ? 'tel' : undefined}
            />
            {field.help ? (
              <span className="mt-1.5 block text-xs text-slate-400">{field.help}</span>
            ) : null}
          </label>
        )
      })}
    </form>
  )
}

export default TopicQrForm
