import { useCallback, useEffect, useState } from 'react'
import MaterialIcon from '../../../components/common/MaterialIcon'
import {
  createCashEntryApi,
  deleteCashEntryApi,
  fetchCashbookApi,
} from '../../../api/cashbookApi'
import { useDialog } from '../../../context/DialogContext'
import { formatMoney, toDateInputValue } from '../../../utils/money'

const EMPTY = {
  type: 'expense',
  date: toDateInputValue(new Date()),
  amount: '',
  content: '',
  note: '',
  counterparty: '',
  isDebt: false,
}

function CashbookPage() {
  const { alert, confirm } = useDialog()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [entries, setEntries] = useState([])
  const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 })
  const [form, setForm] = useState(EMPTY)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const load = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const params = { month, year }
      if (typeFilter !== 'all') params.type = typeFilter
      const result = await fetchCashbookApi(params)
      setEntries(result.data || [])
      setTotals(result.totals || { income: 0, expense: 0, balance: 0 })
    } catch (err) {
      setError(err.message || 'Không thể tải sổ thu chi.')
    } finally {
      setIsLoading(false)
    }
  }, [month, year, typeFilter])

  useEffect(() => {
    load()
  }, [load])

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      await createCashEntryApi({
        ...form,
        amount: Number(form.amount) || 0,
      })
      setForm({ ...EMPTY, date: toDateInputValue(new Date()) })
      await load()
    } catch (err) {
      setError(err.message || 'Không thể lưu bút toán.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    const ok = await confirm({
      title: 'Xóa bút toán',
      message: 'Xóa bút toán này khỏi sổ thu chi?',
      confirmLabel: 'Xóa',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await deleteCashEntryApi(id)
      await load()
    } catch (err) {
      await alert({
        title: 'Không thể xóa',
        message: err.message || 'Không thể xóa.',
        variant: 'error',
      })
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-rose-100 bg-white/80 px-4 py-4 backdrop-blur md:px-8">
        <h2 className="text-2xl font-semibold text-slate-900">Thu chi</h2>
        <p className="mt-1 text-sm text-slate-500">Sổ quỹ theo tháng — chi / thu / nợ NCC.</p>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
            <p className="text-xs font-medium text-emerald-700">Tổng thu</p>
            <p className="mt-1 text-xl font-semibold text-emerald-800">{formatMoney(totals.income)}</p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
            <p className="text-xs font-medium text-rose-700">Tổng chi</p>
            <p className="mt-1 text-xl font-semibold text-rose-800">{formatMoney(totals.expense)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-600">Chênh lệch</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{formatMoney(totals.balance)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm"
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          {['all', 'expense', 'income'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTypeFilter(value)}
              className={[
                'rounded-xl border px-3 py-2 text-sm font-medium',
                typeFilter === value
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : 'border-rose-100 bg-white text-slate-600',
              ].join(' ')}
            >
              {value === 'all' ? 'Tất cả' : value === 'expense' ? 'Chi' : 'Thu'}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-3"
        >
          <h3 className="md:col-span-2 lg:col-span-3 text-sm font-semibold text-slate-900">
            Thêm bút toán
          </h3>
          <select
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
            className="rounded-xl border border-rose-100 px-3 py-2.5 text-sm"
          >
            <option value="expense">Chi tiêu</option>
            <option value="income">Thu nhập</option>
          </select>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            className="rounded-xl border border-rose-100 px-3 py-2.5 text-sm"
          />
          <input
            type="number"
            required
            min="0"
            placeholder="Số tiền"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            className="rounded-xl border border-rose-100 px-3 py-2.5 text-sm"
          />
          <input
            required
            placeholder="Nội dung"
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            className="rounded-xl border border-rose-100 px-3 py-2.5 text-sm md:col-span-2"
          />
          <input
            placeholder="Đối tượng (Ny, anh Hiếu...)"
            value={form.counterparty}
            onChange={(e) => setForm((p) => ({ ...p, counterparty: e.target.value }))}
            className="rounded-xl border border-rose-100 px-3 py-2.5 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isDebt}
              onChange={(e) => setForm((p) => ({ ...p, isDebt: e.target.checked }))}
            />
            Là nợ
          </label>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60 lg:col-span-3"
          >
            {isSaving ? 'Đang lưu...' : 'Thêm vào sổ'}
          </button>
        </form>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : null}

        {isLoading ? (
          <p className="py-10 text-center text-sm text-slate-500">Đang tải...</p>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-white py-16 text-center">
            <MaterialIcon name="account_balance_wallet" className="text-4xl text-slate-300" />
            <p className="mt-3 text-sm text-slate-600">Chưa có bút toán tháng này</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-rose-100 bg-rose-50/60 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Ngày</th>
                    <th className="px-4 py-3">Loại</th>
                    <th className="px-4 py-3">Nội dung</th>
                    <th className="px-4 py-3">Số tiền</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {new Intl.DateTimeFormat('vi-VN').format(new Date(entry.date))}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={[
                            'rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                            entry.type === 'income'
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                              : 'bg-rose-50 text-rose-700 ring-rose-100',
                          ].join(' ')}
                        >
                          {entry.type === 'income' ? 'Thu' : 'Chi'}
                        </span>
                        {entry.isDebt ? (
                          <span className="ml-1 text-xs text-amber-600">Nợ {entry.counterparty}</span>
                        ) : entry.counterparty ? (
                          <span className="ml-1 text-xs text-slate-400">{entry.counterparty}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{entry.content}</p>
                        {entry.note ? <p className="text-xs text-slate-400">{entry.note}</p> : null}
                      </td>
                      <td
                        className={[
                          'whitespace-nowrap px-4 py-3 font-semibold',
                          entry.type === 'income' ? 'text-emerald-700' : 'text-rose-700',
                        ].join(' ')}
                      >
                        {entry.type === 'income' ? '+' : '−'}
                        {formatMoney(entry.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          className="text-xs text-slate-400 hover:text-red-500"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CashbookPage
