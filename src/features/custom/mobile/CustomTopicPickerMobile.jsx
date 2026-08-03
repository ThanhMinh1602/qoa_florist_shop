import MaterialIcon from '../../../components/common/MaterialIcon'

function CustomTopicPickerMobile({ topics, topicId, onSelect }) {
  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-on-surface">Chủ đề</span>
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
                  ? 'border-primary/40 bg-surface-container-low text-primary ring-1 ring-primary/20'
                  : 'border-outline-variant/25 bg-surface-container-lowest text-on-surface active:bg-surface-container-low/50',
              ].join(' ')}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest text-xl shadow-sm">
                <MaterialIcon name={topic.icon} className="text-xl text-primary" />
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
