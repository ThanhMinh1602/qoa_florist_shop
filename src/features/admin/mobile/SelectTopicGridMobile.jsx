import { TOPICS } from '../../../constants/topics'

function SelectTopicGridMobile({ onSelectTopic }) {
  return (
    <div className="space-y-3">
      {TOPICS.map((topic) => {
        const isDisabled = !topic.available

        return (
          <button
            key={topic.id}
            type="button"
            disabled={isDisabled}
            onClick={() => onSelectTopic(topic)}
            className={[
              'w-full rounded-2xl border p-4 text-left transition active:scale-[0.99]',
              isDisabled
                ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-70'
                : 'border-rose-100 bg-white active:bg-rose-50/40',
            ].join(' ')}
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-2xl"
              >
                {topic.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-base font-semibold text-slate-900">{topic.name}</span>
                  {isDisabled ? (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      Sắp ra mắt
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                      Khả dụng
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm leading-5 text-slate-500">{topic.description}</span>
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default SelectTopicGridMobile
