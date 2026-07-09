function CustomTopicPickerMobile({ topics, topicId, onSelect }) {
  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-slate-700">Chủ đề</span>
      <div className="grid gap-2">
        {topics.map((topic) => {
          const isActive = topicId === topic.id

          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => onSelect(topic.id)}
              className={[
                'flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition active:scale-[0.99]',
                isActive
                  ? 'border-rose-300 bg-rose-50 text-rose-700 ring-1 ring-rose-100'
                  : 'border-rose-100 bg-white text-slate-700 active:bg-rose-50/50',
              ].join(' ')}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                {topic.emoji}
              </span>
              <span className="text-sm font-medium">{topic.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CustomTopicPickerMobile
