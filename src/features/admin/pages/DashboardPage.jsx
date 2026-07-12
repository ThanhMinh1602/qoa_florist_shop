import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { fetchStatsOverviewApi } from '../../../api/statsApi'
import { formatMoney } from '../../../utils/money'
import { getInvoiceCode } from '../../../utils/invoiceCode'
import { ORDER_STATUS_LABELS } from '../../../constants/orderStatus'

function KpiCard({ icon, label, value, hint, tone = 'rose' }) {
  const tones = {
    rose: 'border-rose-100 bg-rose-50/40 text-rose-700',
    emerald: 'border-emerald-100 bg-emerald-50/40 text-emerald-700',
    sky: 'border-sky-100 bg-sky-50/40 text-sky-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  }

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <div className="flex items-center gap-2 text-sm font-medium opacity-80">
        <MaterialIcon name={icon} className="text-lg" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

function DashboardPage() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const result = await fetchStatsOverviewApi()
      setData(result.data)
    } catch (err) {
      setError(err.message || 'Không thể tải dashboard.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const maxRevenue = Math.max(...(data?.chartMonths?.map((m) => m.revenue) || [1]), 1)

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-rose-100 bg-white/80 px-4 py-4 backdrop-blur md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
            <p className="mt-1 text-sm text-slate-500">
              Doanh thu & đơn theo ngày / tháng / năm.
            </p>
          </div>
          <Link
            to="/admin/orders/new"
            className="inline-flex items-center gap-1 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            <MaterialIcon name="edit_note" className="text-lg" />
            Lên đơn
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : null}

        {isLoading || !data ? (
          <p className="py-16 text-center text-sm text-slate-500">Đang tải thống kê...</p>
        ) : (
          <>
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Hôm nay
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  icon="payments"
                  label="Doanh thu"
                  value={formatMoney(data.today.revenue)}
                  hint={`${data.today.orderCount} đơn`}
                  tone="emerald"
                />
                <KpiCard
                  icon="trending_up"
                  label="LN ước tính"
                  value={formatMoney(data.today.profit)}
                  tone="sky"
                />
                <KpiCard
                  icon="savings"
                  label="Cọc đã thu"
                  value={formatMoney(data.today.deposit)}
                  tone="rose"
                />
                <KpiCard
                  icon="local_shipping"
                  label="Tiền ship"
                  value={formatMoney(data.today.shippingFee)}
                  tone="slate"
                />
              </div>
            </section>

            <section className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">Tháng này</h3>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-400">Doanh thu</dt>
                    <dd className="text-lg font-semibold">{formatMoney(data.month.revenue)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Số đơn</dt>
                    <dd className="text-lg font-semibold">{data.month.orderCount}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">LN ước tính</dt>
                    <dd className="text-lg font-semibold text-emerald-700">
                      {formatMoney(data.month.profit)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Thu − Chi (sổ)</dt>
                    <dd className="text-lg font-semibold">{formatMoney(data.month.cashBalance)}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-slate-500">
                  Sổ quỹ: thu {formatMoney(data.month.cashIncome)} · chi{' '}
                  {formatMoney(data.month.cashExpense)}
                </p>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">Năm nay</h3>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-400">Doanh thu</dt>
                    <dd className="text-lg font-semibold">{formatMoney(data.year.revenue)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Số đơn</dt>
                    <dd className="text-lg font-semibold">{data.year.orderCount}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">LN ước tính</dt>
                    <dd className="text-lg font-semibold text-emerald-700">
                      {formatMoney(data.year.profit)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Cọc</dt>
                    <dd className="text-lg font-semibold">{formatMoney(data.year.deposit)}</dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Doanh thu 6 tháng gần nhất</h3>
              <div className="mt-4 flex h-40 items-end gap-2">
                {data.chartMonths.map((month) => (
                  <div key={month.key} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-lg bg-rose-400/80 transition"
                      style={{
                        height: `${Math.max(4, (month.revenue / maxRevenue) * 100)}%`,
                      }}
                      title={formatMoney(month.revenue)}
                    />
                    <span className="text-[10px] text-slate-500">{month.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Đơn chờ làm</h3>
                  <Link to="/admin/manage" className="text-xs font-medium text-rose-600">
                    Xem tất cả
                  </Link>
                </div>
                <ul className="mt-3 divide-y divide-rose-50">
                  {(data.pendingOrders || []).slice(0, 6).map((order) => {
                    const status =
                      ORDER_STATUS_LABELS[order.status] ?? ORDER_STATUS_LABELS.pending
                    return (
                      <li key={order.id} className="flex items-center justify-between gap-2 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {order.customerName}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400">
                            {getInvoiceCode(order)}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </li>
                    )
                  })}
                  {(data.pendingOrders || []).length === 0 ? (
                    <li className="py-6 text-center text-sm text-slate-400">Không có đơn chờ</li>
                  ) : null}
                </ul>
              </section>

              <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">Top sản phẩm</h3>
                <ul className="mt-3 space-y-2">
                  {(data.topProducts || []).map((product) => (
                    <li
                      key={product.productId || product.productName}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="truncate text-slate-700">
                        {product.productName}
                        <span className="ml-1 text-xs text-slate-400">×{product.quantity}</span>
                      </span>
                      <span className="shrink-0 font-medium">{formatMoney(product.revenue)}</span>
                    </li>
                  ))}
                  {(data.topProducts || []).length === 0 ? (
                    <li className="py-6 text-center text-sm text-slate-400">
                      Chưa có dữ liệu bán hàng
                    </li>
                  ) : null}
                </ul>

                <h3 className="mt-5 text-sm font-semibold text-slate-900">Thu chi gần đây</h3>
                <ul className="mt-2 space-y-2">
                  {(data.recentCash || []).slice(0, 5).map((entry) => (
                    <li key={entry.id} className="flex justify-between gap-2 text-sm">
                      <span className="truncate text-slate-600">{entry.content}</span>
                      <span
                        className={
                          entry.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                        }
                      >
                        {entry.type === 'income' ? '+' : '−'}
                        {formatMoney(entry.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
