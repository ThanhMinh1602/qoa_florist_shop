import { useState } from 'react'
import MobileFrame from '../common/MobileFrame'
import MaterialIcon from '../common/MaterialIcon'

const PANEL_ANIM =
  'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]'

function CollapsiblePreview({ label, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm shadow-rose-50">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-slate-900">{label}</span>
        <span
          className={[
            'flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition-transform duration-300 ease-out',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
          aria-hidden="true"
        >
          <MaterialIcon name="expand_more" className="text-xl" />
        </span>
      </button>

      <div
        className={[PANEL_ANIM, isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'].join(' ')}
        aria-hidden={!isOpen}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={[
              'border-t border-rose-50 px-4 pb-4 transition-opacity duration-300 ease-out',
              isOpen ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          >
            <div className="mt-4 flex justify-center [&_.mobile-frame__screen]:!h-[min(52vh,480px)] [&_.mobile-frame__screen]:!w-[min(84vw,280px)]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MobilePreviewFrame({ label, children }) {
  return <MobileFrame label={label}>{children}</MobileFrame>
}

export { CollapsiblePreview, MobilePreviewFrame }
