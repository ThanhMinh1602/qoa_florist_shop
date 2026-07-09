function MobileStepIndicator({ step, steps }) {
  return (
    <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 lg:hidden">
      {steps.map((item, index) => {
        const stepNumber = index + 1
        const isActive = step >= stepNumber
        const isLast = index === steps.length - 1

        return (
          <div key={item.id} className="flex min-w-0 items-center gap-2">
            <div className={`flex min-w-0 items-center gap-2 ${isActive ? 'text-rose-700' : 'text-slate-400'}`}>
              <span
                className={[
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  isActive ? 'bg-rose-500 text-white' : 'bg-slate-100',
                ].join(' ')}
              >
                {stepNumber}
              </span>
              <span className="truncate text-sm font-medium">{item.label}</span>
            </div>
            {!isLast ? <span className="h-px w-6 shrink-0 bg-rose-100" /> : null}
          </div>
        )
      })}
    </div>
  )
}

export default MobileStepIndicator
