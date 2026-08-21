import MaterialIcon from '../../../components/common/MaterialIcon'
import {
  PAYMENT_STATUS_OPTIONS,
  SHIPPING_STATUS_OPTIONS,
} from '../../../constants/customRequestDefaults'
import { ORDER_STATUS_OPTIONS } from '../../../constants/orderStatus'
import {
  ORDER_DATE_FIELD_OPTIONS,
  ORDER_DATE_PRESETS,
  countActiveOrderFilters,
  getOrderDatePresetRange,
  summarizeActiveOrderFilters,
} from '../../../utils/orderFilters'

const headingClass = 'text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase'
const controlClass =
  'h-8 w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-2.5 text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20'

const chipClass = (active) =>
  [
    'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition',
    active
      ? 'bg-primary text-white shadow-sm'
      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high',
  ].join(' ')

function FilterField({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[10px] font-medium text-on-surface-variant">{label}</span>
      {children}
    </label>
  )
}

function OrderFilters({
  filters,
  search,
  onSearchChange,
  onChange,
  onReset,
  expanded = false,
  onToggleExpanded,
}) {
  const activeCount = countActiveOrderFilters({ ...filters, q: search })
  const summaryChips = summarizeActiveOrderFilters(filters)
  const preset = filters.preset || ''

  function handlePreset(id) {
    if (preset === id) {
      onChange({ from: '', to: '' })
      return
    }
    onChange(getOrderDatePresetRange(id))
  }

  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest shadow-sm">
      <header className="flex items-center gap-1.5 px-2 py-1.5 md:px-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MaterialIcon name="tune" className="text-base" />
        </span>
        <div className="relative min-w-0 flex-1">
          <MaterialIcon
            name="search"
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-base text-outline"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm đơn…"
            className={`${controlClass} pl-7`}
          />
        </div>
        {summaryChips.length > 0 ? (
          <div className="hidden min-w-0 items-center gap-1 overflow-hidden sm:flex">
            {summaryChips.slice(0, 3).map((chip) => (
              <span
                key={chip.id}
                className="max-w-[9rem] truncate rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
              >
                {chip.label}
              </span>
            ))}
            {summaryChips.length > 3 ? (
              <span className="text-[10px] font-medium text-outline">+{summaryChips.length - 3}</span>
            ) : null}
          </div>
        ) : null}
        {activeCount > 0 ? (
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary sm:hidden">
            {activeCount}
          </span>
        ) : null}
        <button
          type="button"
          onClick={onToggleExpanded}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
          aria-expanded={expanded}
          aria-label={expanded ? 'Thu bộ lọc' : 'Mở bộ lọc'}
          title={expanded ? 'Thu bộ lọc' : 'Mở bộ lọc'}
        >
          <MaterialIcon name={expanded ? 'expand_less' : 'expand_more'} className="text-xl" />
        </button>
      </header>

      {expanded ? (
        <div className="border-t border-outline-variant/20 p-2.5 md:p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold text-on-surface">Bộ lọc</h3>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
              >
                <MaterialIcon name="filter_alt_off" className="text-sm" />
                Xóa lọc ({activeCount})
              </button>
            ) : (
              <span className="text-[11px] text-outline">Tất cả đơn</span>
            )}
          </div>

          <div className="grid gap-3 lg:grid-cols-2 lg:gap-0">
            <div className="min-w-0 lg:border-r lg:border-outline-variant/20 lg:pr-3">
              <h4 className={headingClass}>Thời gian</h4>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <FilterField label="Theo">
                  <select
                    value={filters.dateField}
                    onChange={(event) => onChange({ dateField: event.target.value })}
                    className={controlClass}
                  >
                    {ORDER_DATE_FIELD_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </FilterField>
                <FilterField label="Từ ngày">
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(event) => onChange({ from: event.target.value })}
                    className={controlClass}
                  />
                </FilterField>
                <FilterField label="Đến ngày">
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(event) => onChange({ to: event.target.value })}
                    className={controlClass}
                  />
                </FilterField>
              </div>
              <div className="mt-2 flex gap-1 overflow-x-auto overscroll-x-contain touch-pan-x pb-0.5 [-webkit-overflow-scrolling:touch]">
                {ORDER_DATE_PRESETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePreset(item.id)}
                    className={chipClass(preset === item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-w-0 border-t border-outline-variant/20 pt-3 lg:border-t-0 lg:pl-3 lg:pt-0">
              <h4 className={headingClass}>Trạng thái</h4>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <FilterField label="Làm hàng">
                  <select
                    value={filters.status}
                    onChange={(event) => onChange({ status: event.target.value })}
                    className={controlClass}
                  >
                    <option value="">Tất cả</option>
                    {ORDER_STATUS_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </FilterField>
                <FilterField label="Giao hàng">
                  <select
                    value={filters.shippingStatus}
                    onChange={(event) => onChange({ shippingStatus: event.target.value })}
                    className={controlClass}
                  >
                    <option value="">Tất cả</option>
                    {SHIPPING_STATUS_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </FilterField>
                <FilterField label="Thanh toán">
                  <select
                    value={filters.paymentStatus}
                    onChange={(event) => onChange({ paymentStatus: event.target.value })}
                    className={controlClass}
                  >
                    <option value="">Tất cả</option>
                    {PAYMENT_STATUS_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </FilterField>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default OrderFilters
