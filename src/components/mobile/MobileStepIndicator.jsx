function MobileStepIndicator({ step, steps }) {
  return (
    <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 lg:hidden">
      {steps.map((item, index) => {
        const stepNumber = index + 1
        const isActive = step >= stepNumber
        const isLast = index === steps.length - 1

        return (
          <div key={item.id} className="flex min-w-0 items-center gap-2">
            <div className={`flex min-w-0 items-center gap-2 ${isActive ? 'text-primary' : 'text-outline'}`}>
              <span
                className={[
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  isActive ? 'bg-primary text-white' : 'bg-surface-container',
                ].join(' ')}
              >
                {stepNumber}
              </span>
              <span className="truncate text-sm font-medium">{item.label}</span>
            </div>
            {!isLast ? <span className="h-px w-6 shrink-0 bg-primary-container/20" /> : null}
          </div>
        )
      })}
    </div>
  )
}

export default MobileStepIndicator
