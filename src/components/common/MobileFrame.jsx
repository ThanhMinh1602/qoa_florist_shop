function MobileFrame({ label = 'Live Preview', children }) {
  return (
    <div className="flex flex-col items-center">
      <p className="mb-4 text-sm font-medium text-on-surface-variant">{label}</p>

      <div className="relative rounded-[2.5rem] border-[10px] border-slate-900 bg-on-surface p-2 shadow-2xl shadow-on-surface/20">
        <div
          className="pointer-events-none absolute left-1/2 top-3 z-20 h-5 w-28 -translate-x-1/2 rounded-full bg-on-surface"
          aria-hidden="true"
        />

        <div className="mobile-frame__screen relative h-[min(72vh,680px)] w-[min(78vw,320px)] overflow-hidden rounded-[1.75rem] bg-surface-container-lowest">
          {children}
        </div>
      </div>
    </div>
  )
}

export default MobileFrame
