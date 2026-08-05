import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { fadeUp, staggerFast } from '../../../lib/motion'
import { createCashEntryApi, deleteCashEntryApi } from '../../../api/cashbookApi'
import { useDialog } from '../../../context/DialogContext'
import { useCashbook } from '../../../hooks/swr'
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
  const [form, setForm] = useState(EMPTY)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const cashParams = useMemo(() => {
    const params = { month, year }
    if (typeFilter !== 'all') params.type = typeFilter
    return params
  }, [month, year, typeFilter])

  const { entries, totals, isLoading, error: cashError, mutate } = useCashbook(cashParams)
  const error = formError || cashError?.message || ''

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setFormError('')
    try {
      await createCashEntryApi({
        ...form,
        amount: Number(form.amount) || 0,
      })
      setForm({ ...EMPTY, date: toDateInputValue(new Date()) })
      await mutate()
    } catch (err) {
      setFormError(err.message || 'Không thể lưu bút toán.')
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
      await mutate()
    } catch (err) {
      await alert({
        title: 'Không thể xóa',
        message: err.message || 'Không thể xóa.',
        variant: 'error',
      })
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-5 md:p-10">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-3xl text-primary md:text-[2rem]">Sổ quỹ</h2>
          <p className="mt-1 text-sm text-on-surface-variant md:text-base">
            Quản lý thu chi và dòng tiền boutique.
          </p>
        </div>
        <a href="#cash-entry-form" className="btn-primary inline-flex items-center gap-2">
          <MaterialIcon name="add" className="text-lg" />
          Thêm khoản thu/chi
        </a>
      </header>

      <motion.section
        className="grid gap-4 md:grid-cols-3 md:gap-6"
        initial="hidden"
        animate="show"
        variants={staggerFast}
      >
        <motion.div className="glass-card relative overflow-hidden rounded-xl p-6" variants={fadeUp}>
          <MaterialIcon
            name="trending_up"
            className="pointer-events-none absolute top-3 right-3 text-[4rem] text-primary opacity-20"
          />
          <p className="label-caps relative z-10 mb-2 text-on-surface-variant">Tổng thu (Tháng này)</p>
          <p className="font-display relative z-10 text-2xl text-primary md:text-3xl">
            {formatMoney(totals.income)}
          </p>
        </motion.div>
        <motion.div className="glass-card relative overflow-hidden rounded-xl p-6" variants={fadeUp}>
          <MaterialIcon
            name="trending_down"
            className="pointer-events-none absolute top-3 right-3 text-[4rem] text-secondary opacity-20"
          />
          <p className="label-caps relative z-10 mb-2 text-on-surface-variant">Tổng chi (Tháng này)</p>
          <p className="font-display relative z-10 text-2xl text-secondary md:text-3xl">
            {formatMoney(totals.expense)}
          </p>
        </motion.div>
        <motion.div className="glass-card relative overflow-hidden rounded-xl border-primary/30 bg-primary-container/20 p-6" variants={fadeUp}>
          <MaterialIcon
            name="account_balance"
            className="pointer-events-none absolute top-3 right-3 text-[4rem] text-primary opacity-20"
          />
          <p className="label-caps relative z-10 mb-2 text-on-surface-variant">Số dư hiện tại</p>
          <p className="font-display relative z-10 text-2xl font-semibold text-primary md:text-3xl">
            {formatMoney(totals.balance)}
          </p>
        </motion.div>
      </motion.section>

      <form
        id="cash-entry-form"
        onSubmit={handleSubmit}
        className="glass-card grid gap-3 rounded-xl p-5 md:grid-cols-2 lg:grid-cols-3 md:p-6"
      >
        <h3 className="label-caps md:col-span-2 lg:col-span-3 text-on-surface">Thêm bút toán</h3>
        <select
          value={form.type}
          onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
          className="input-glass"
        >
          <option value="expense">Chi tiêu</option>
          <option value="income">Thu nhập</option>
        </select>
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
          className="input-glass"
        />
        <input
          type="number"
          required
          min="0"
          placeholder="Số tiền"
          value={form.amount}
          onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
          className="input-glass"
        />
        <input
          required
          placeholder="Nội dung"
          value={form.content}
          onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
          className="input-glass md:col-span-2"
        />
        <input
          placeholder="Đối tượng (Ny, anh Hiếu...)"
          value={form.counterparty}
          onChange={(e) => setForm((p) => ({ ...p, counterparty: e.target.value }))}
          className="input-glass"
        />
        <label className="flex items-center gap-2 text-sm text-on-surface-variant">
          <input
            type="checkbox"
            checked={form.isDebt}
            onChange={(e) => setForm((p) => ({ ...p, isDebt: e.target.checked }))}
          />
          Là nợ
        </label>
        <button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-60 lg:col-span-3">
          {isSaving ? 'Đang lưu...' : 'Thêm vào sổ'}
        </button>
      </form>

      <section className="glass-card rounded-xl p-5 md:p-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end md:justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="label-caps text-on-surface-variant">Tháng</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="input-glass"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label-caps text-on-surface-variant">Năm</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="input-glass"
              >
                {[year - 1, year, year + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label-caps text-on-surface-variant">Lọc theo loại</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'expense', 'income'].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTypeFilter(value)}
                    className={[
                      'rounded-lg border px-3 py-2 text-sm font-medium transition',
                      typeFilter === value
                        ? 'border-primary/40 bg-primary-container/20 text-primary'
                        : 'border-white/55 bg-surface-container-lowest/50 text-on-surface-variant hover:bg-surface-variant/50',
                    ].join(' ')}
                  >
                    {value === 'all' ? 'Tất cả' : value === 'expense' ? 'Chi' : 'Thu'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <p className="mb-4 rounded-xl bg-error-container/40 px-4 py-3 text-sm text-error">{error}</p>
        ) : null}

        {isLoading ? (
          <p className="py-10 text-center text-sm text-on-surface-variant">Đang tải...</p>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant/40 py-16 text-center">
            <MaterialIcon name="account_balance_wallet" className="text-4xl text-outline" />
            <p className="mt-3 text-sm text-on-surface-variant">Chưa có bút toán tháng này</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/55">
                  <th className="label-caps px-4 py-4 text-on-surface-variant">Ngày</th>
                  <th className="label-caps px-4 py-4 text-on-surface-variant">Loại</th>
                  <th className="label-caps px-4 py-4 text-on-surface-variant">Nội dung</th>
                  <th className="label-caps px-4 py-4 text-right text-on-surface-variant">Số tiền</th>
                  <th className="label-caps px-4 py-4 text-center text-on-surface-variant">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-white/20 transition-colors hover:bg-surface-variant/20"
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-on-surface">
                      {new Intl.DateTimeFormat('vi-VN').format(new Date(entry.date))}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={[
                          'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider',
                          entry.type === 'income'
                            ? 'bg-primary-container/30 text-primary'
                            : 'bg-error-container/50 text-error',
                        ].join(' ')}
                      >
                        <MaterialIcon
                          name={entry.type === 'income' ? 'arrow_upward' : 'arrow_downward'}
                          className="text-sm"
                        />
                        {entry.type === 'income' ? 'Thu' : 'Chi'}
                      </span>
                      {entry.isDebt ? (
                        <span className="ml-1 text-xs text-amber-700">Nợ {entry.counterparty}</span>
                      ) : entry.counterparty ? (
                        <span className="ml-1 text-xs text-outline">{entry.counterparty}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-on-surface">{entry.content}</p>
                      {entry.note ? <p className="text-xs text-on-surface-variant">{entry.note}</p> : null}
                    </td>
                    <td
                      className={[
                        'whitespace-nowrap px-4 py-4 text-right font-semibold',
                        entry.type === 'income' ? 'text-primary' : 'text-secondary',
                      ].join(' ')}
                    >
                      {entry.type === 'income' ? '+' : '−'} {formatMoney(entry.amount)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        className="text-on-surface-variant transition hover:text-error"
                        aria-label="Xóa"
                      >
                        <MaterialIcon name="delete" className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default CashbookPage
