import { TOPICS } from '../../../constants/topics'

const EMPTY_FILTERS = {
  search: '',
  phone: '',
  recipientName: '',
  topicId: '',
  from: '',
  to: '',
}

function ManageCardsFilters({ filters, onChange, onApply, onReset, isLoading }) {
  function handleChange(field, value) {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm shadow-rose-50">
      <h3 className="text-sm font-semibold text-slate-900">Bộ lọc</h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="block xl:col-span-2">
          <span className="text-xs font-medium text-slate-500">Tìm kiếm chung</span>
          <input
            type="search"
            value={filters.search}
            onChange={(event) => handleChange('search', event.target.value)}
            placeholder="Tên, SĐT, lời chúc..."
            className="mt-1.5 w-full rounded-xl border border-rose-100 px-3 py-2.5 text-sm text-slate-800 outline-none ring-rose-200 transition focus:ring-2"
          />
        </label>

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
                {topic.name}
              </option>
            ))}
          </select>
        </label>

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

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onApply}
          disabled={isLoading}
          className="rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Đang tải...' : 'Áp dụng lọc'}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={isLoading}
          className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Xóa bộ lọc
        </button>
      </div>
    </div>
  )
}

export { EMPTY_FILTERS }
export default ManageCardsFilters
