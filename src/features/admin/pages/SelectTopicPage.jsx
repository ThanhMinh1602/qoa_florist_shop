import { useNavigate } from 'react-router-dom'
import { TOPICS } from '../../../constants/topics'

function SelectTopicPage() {
  const navigate = useNavigate()

  function handleSelectTopic(topic) {
    if (!topic.available) return
    navigate(`/admin/create/${topic.id}`)
  }

  return (
    <div className="flex flex-1 flex-col p-6 md:p-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-rose-500">Bước 1 / 2</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Chọn chủ đề thiệp</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Chọn loại thiệp phù hợp với dịp. Hiện tại chỉ mở chủ đề Sinh nhật; các chủ đề khác sẽ
          được bổ sung sau.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TOPICS.map((topic) => {
          const isDisabled = !topic.available

          return (
            <button
              key={topic.id}
              type="button"
              disabled={isDisabled}
              onClick={() => handleSelectTopic(topic)}
              className={[
                'group rounded-2xl border p-5 text-left transition',
                isDisabled
                  ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-70'
                  : 'border-rose-100 bg-white hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-2xl"
                >
                  {topic.emoji}
                </span>

                {isDisabled ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                    Sắp ra mắt
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                    Khả dụng
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">{topic.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{topic.description}</p>

              {!isDisabled ? (
                <p className="mt-4 text-sm font-medium text-rose-600 group-hover:text-rose-700">
                  Chọn chủ đề này →
                </p>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SelectTopicPage
