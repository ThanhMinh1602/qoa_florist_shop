import logoSrc from '../../assets/images/icons/logo.jpg'

const SIZE_CLASS = {
  xs: 'h-10 w-10',
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
  xl: 'h-28 w-28',
}

function BrandLogo({ size = 'md', className = '', subtitle = '', center = false }) {
  return (
    <div
      className={[
        'flex flex-col',
        center ? 'items-center text-center' : 'items-start',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <img
        src={logoSrc}
        alt="QOA florist"
        className={[
          SIZE_CLASS[size] ?? SIZE_CLASS.md,
          'shrink-0 rounded-full object-cover ring-1 ring-rose-100',
        ].join(' ')}
      />
      {subtitle ? (
        <p className="mt-1.5 text-xs font-medium tracking-wide text-slate-500">{subtitle}</p>
      ) : null}
    </div>
  )
}

export { logoSrc }
export default BrandLogo
