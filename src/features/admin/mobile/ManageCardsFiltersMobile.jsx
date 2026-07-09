import { useState } from 'react'
import { TOPICS } from '../../../constants/topics'

function ManageCardsFiltersMobile({ filters, onChange, onApply, onReset, isLoading }) {
  const [isOpen, setIsOpen] = useState(false)

  function handleChange(field, value) {
    onChange({ ...filters, [field]: value })
  }

  const activeCount = [
    filters.search,
    filters.phone,
    filters.recipientName,
    filters.topicId,
    filters.from,
    filters.to,
  ].filter(Boolean).length

  return (
    <div className="rounded-2xl border border-rose-100 bg-white shadow-sm shadow-rose-50">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span>
          <span className="text-sm font-semibold text-slate-900">Bộ lọc</span>
          {activeCount > 0 ? (
            <span className="mt-0.5 block text-xs text-rose-600">{activeCount} tiêu chí đang chọn</span>
          ) : (
            <span className="mt-0.5 block text-xs text-slate-500">Chạm để mở bộ lọc</span>
          )}
        </span>
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
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Tìm kiếm chung</span>
              <input
                type="search"
                value={filters.search}
                onChange={(event) => handleChange('search', event.target.value)}
                placeholder="Tên, SĐT, lời chúc..."
                className="mt-1.5 w-full rounded-xl border border-rose-100 px-3 py-2.5 text-sm text-slate-800 outline-none ring-rose-200 transition focus:ring-2"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Số điện thoại</span>
                <input
                  type="text"
                  value={filters.phone}
                  onChange={(event) => handleChange('phone', event.target.value)}
                  placeholder="09xx..."
                  className="mt-1.5 w-full rounded-xl border border-rose-100 px-3 py-2.5 text-sm text-slate-800 outline-none ring-rose-200 transition focus:ring-2"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-500">Người nhận</span>
                <input
                  type="text"
                  value={filters.recipientName}
                  onChange={(event) => handleChange('recipientName', event.target.value)}
                  placeholder="Tên người nhận"
                  className="mt-1.5 w-full rounded-xl border border-rose-100 px-3 py-2.5 text-sm text-slate-800 outline-none ring-rose-200 transition focus:ring-2"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-slate-500">Chủ đề</span>
              <select
                value={filters.topicId}
                onChange={(event) => handleChange('topicId', event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-rose-100 px-3 py-2.5 text-sm text-slate-800 outline-none ring-rose-200 transition focus:ring-2"
              >
                <option value="">Tất cả</option>
                {TOPICS.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.emoji} {topic.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Từ ngày</span>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(event) => handleChange('from', event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-rose-100 px-3 py-2.5 text-sm text-slate-800 outline-none ring-rose-200 transition focus:ring-2"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-500">Đến ngày</span>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(event) => handleChange('to', event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-rose-100 px-3 py-2.5 text-sm text-slate-800 outline-none ring-rose-200 transition focus:ring-2"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onApply}
              disabled={isLoading}
              className="rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Đang tải...' : 'Áp dụng'}
            </button>
            <button
              type="button"
              onClick={onReset}
              disabled={isLoading}
              className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Xóa lọc
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ManageCardsFiltersMobile
