import { useState } from 'react'
import MobileFrame from '../common/MobileFrame'

function CollapsiblePreview({ label, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="rounded-2xl border border-rose-100 bg-white shadow-sm shadow-rose-50">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-slate-900">{label}</span>
        <span
          className={[
            'flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition-transform',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
          aria-hidden="true"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
            <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
          </svg>
        </span>
      </button>

      {isOpen ? (
        <div className="border-t border-rose-50 px-4 pb-4">
          <div className="mt-4 flex justify-center [&_.mobile-frame__screen]:!h-[min(52vh,480px)] [&_.mobile-frame__screen]:!w-[min(84vw,280px)]">
            {children}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MobilePreviewFrame({ label, children }) {
  return <MobileFrame label={label}>{children}</MobileFrame>
}

export { CollapsiblePreview, MobilePreviewFrame }
