import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import MaterialIcon from '../../../components/common/MaterialIcon'
import AdminPageHeader from '../components/AdminPageHeader'
import { fadeUp, staggerFast } from '../../../lib/motion'
import { createCashEntryApi, deleteCashEntryApi } from '../../../api/cashbookApi'
import { useDialog } from '../../../context/DialogContext'
import { useCashbook } from '../../../hooks/swr'
import { useScrollLock } from '../../../hooks/useScrollLock'
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

function CashEntryCard({ entry, onDelete }) {
  const isIncome = entry.type === 'income'
  return (
    <li className="rounded-2xl border border-outline-variant/20 bg-white/55 p-3.5 shadow-sm backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={[
                'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                isIncome ? 'bg-primary-container/30 text-primary' : 'bg-error-container/50 text-error',
              ].join(' ')}
            >
              <MaterialIcon
                name={isIncome ? 'arrow_upward' : 'arrow_downward'}
                className="text-sm"
              />
              {isIncome ? 'Thu' : 'Chi'}
            </span>
            <span className="text-[11px] text-on-surface-variant">
              {new Intl.DateTimeFormat('vi-VN').format(new Date(entry.date))}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-medium leading-snug text-on-surface">{entry.content}</p>
          {entry.note ? <p className="mt-0.5 text-xs text-on-surface-variant">{entry.note}</p> : null}
          {entry.isDebt ? (
            <p className="mt-1 text-xs text-amber-700">Nợ {entry.counterparty || ''}</p>
          ) : entry.counterparty ? (
            <p className="mt-1 text-xs text-outline">{entry.counterparty}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <p className={['text-sm font-semibold', isIncome ? 'text-primary' : 'text-secondary'].join(' ')}>
            {isIncome ? '+' : '−'} {formatMoney(entry.amount)}
          </p>
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-error-container/40 hover:text-error"
            aria-label="Xóa"
          >
            <MaterialIcon name="delete" className="text-lg" />
          </button>
        </div>
      </div>
    </li>
  )
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
  const [formOpen, setFormOpen] = useState(false)
  useScrollLock(formOpen)

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
      setFormOpen(false)
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

  const formFields = (
    <>
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
        inputMode="decimal"
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
    </>
  )

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pb-6 lg:gap-8 lg:p-10">
      <AdminPageHeader
        title="Sổ quỹ"
        subtitle="Quản lý thu chi và dòng tiền boutique."
        className="!px-0 !py-0"
        actions={
          <>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="btn-primary inline-flex items-center gap-1.5 !px-3 !py-2 text-[10px] lg:hidden"
            >
              <MaterialIcon name="add" className="text-lg" />
              Thêm
            </button>
            <a
              href="#cash-entry-form"
              className="btn-primary hidden items-center gap-2 lg:inline-flex"
            >
              <MaterialIcon name="add" className="text-lg" />
              Thêm khoản thu/chi
            </a>
          </>
        }
      />

      <motion.section
        className="grid grid-cols-3 gap-2 lg:grid-cols-3 lg:gap-6"
        initial="hidden"
        animate="show"
        variants={staggerFast}
      >
        <motion.div className="glass-card relative overflow-hidden rounded-xl p-3 lg:p-6" variants={fadeUp}>
          <MaterialIcon
            name="trending_up"
            className="pointer-events-none absolute top-2 right-2 hidden text-[4rem] text-primary opacity-20 lg:block"
          />
          <p className="label-caps relative z-10 mb-1 text-[9px] text-on-surface-variant lg:mb-2 lg:text-xs">
            Tổng thu
          </p>
          <p className="font-display relative z-10 text-sm leading-tight text-primary lg:text-3xl">
            {formatMoney(totals.income)}
          </p>
        </motion.div>
        <motion.div className="glass-card relative overflow-hidden rounded-xl p-3 lg:p-6" variants={fadeUp}>
          <MaterialIcon
            name="trending_down"
            className="pointer-events-none absolute top-2 right-2 hidden text-[4rem] text-secondary opacity-20 lg:block"
          />
          <p className="label-caps relative z-10 mb-1 text-[9px] text-on-surface-variant lg:mb-2 lg:text-xs">
            Tổng chi
          </p>
          <p className="font-display relative z-10 text-sm leading-tight text-secondary lg:text-3xl">
            {formatMoney(totals.expense)}
          </p>
        </motion.div>
        <motion.div
          className="glass-card relative overflow-hidden rounded-xl border-primary/30 bg-primary-container/20 p-3 lg:p-6"
          variants={fadeUp}
        >
          <MaterialIcon
            name="account_balance"
            className="pointer-events-none absolute top-2 right-2 hidden text-[4rem] text-primary opacity-20 lg:block"
          />
          <p className="label-caps relative z-10 mb-1 text-[9px] text-on-surface-variant lg:mb-2 lg:text-xs">
            Số dư
          </p>
          <p className="font-display relative z-10 text-sm font-semibold leading-tight text-primary lg:text-3xl">
            {formatMoney(totals.balance)}
          </p>
        </motion.div>
      </motion.section>

      {/* Desktop form */}
      <form
        id="cash-entry-form"
        onSubmit={handleSubmit}
        className="glass-card hidden gap-3 rounded-xl p-6 md:grid-cols-2 lg:grid lg:grid-cols-3"
      >
        <h3 className="label-caps text-on-surface lg:col-span-3">Thêm bút toán</h3>
        {formFields}
      </form>

      {/* Mobile form bottom sheet */}
      {formOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-on-surface/40"
            aria-label="Đóng"
            onClick={() => setFormOpen(false)}
          />
          <form
            onSubmit={handleSubmit}
            className="relative z-10 flex max-h-[min(90dvh,640px)] w-full flex-col rounded-t-3xl bg-surface-container-lowest shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex flex-1 flex-col items-center">
                <span className="mb-2 h-1 w-10 rounded-full bg-outline-variant/50" aria-hidden="true" />
                <h3 className="font-display w-full text-left text-lg text-on-surface">Thêm bút toán</h3>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant"
                aria-label="Đóng"
              >
                <MaterialIcon name="close" />
              </button>
            </div>
            <div
              data-scroll-lock-scrollable
              className="grid min-h-0 flex-1 gap-2.5 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              {formFields}
            </div>
          </form>
        </div>
      ) : null}

      <section className="glass-card rounded-xl p-3.5 lg:p-8">
        <div className="mb-4 flex flex-col gap-3 lg:mb-6 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
          <div className="flex flex-wrap gap-2 lg:gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-none">
              <label className="label-caps text-[10px] text-on-surface-variant lg:text-xs">Tháng</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="input-glass !py-2 text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex min-w-[5.5rem] flex-col gap-1">
              <label className="label-caps text-[10px] text-on-surface-variant lg:text-xs">Năm</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="input-glass !py-2 text-sm"
              >
                {[year - 1, year, year + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['all', 'expense', 'income'].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTypeFilter(value)}
                className={[
                  'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition lg:px-3 lg:py-2 lg:text-sm',
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

        {error ? (
          <p className="mb-4 rounded-xl bg-error-container/40 px-4 py-3 text-sm text-error">{error}</p>
        ) : null}

        {isLoading ? (
          <p className="py-10 text-center text-sm text-on-surface-variant">Đang tải...</p>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant/40 py-12 text-center lg:py-16">
            <MaterialIcon name="account_balance_wallet" className="text-4xl text-outline" />
            <p className="mt-3 text-sm text-on-surface-variant">Chưa có bút toán tháng này</p>
          </div>
        ) : (
          <>
            <ul className="space-y-2.5 lg:hidden">
              {entries.map((entry) => (
                <CashEntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
              ))}
            </ul>

            <div className="hidden overflow-x-auto lg:block">
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
                        {entry.note ? (
                          <p className="text-xs text-on-surface-variant">{entry.note}</p>
                        ) : null}
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
          </>
        )}
      </section>
    </div>
  )
}

export default CashbookPage
