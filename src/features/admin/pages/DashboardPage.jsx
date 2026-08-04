import { Link } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { useStatsOverview } from '../../../hooks/swr'
import { formatMoney } from '../../../utils/money'
import { getInvoiceCode } from '../../../utils/invoiceCode'
import { ORDER_STATUS_LABELS } from '../../../constants/orderStatus'

function KpiCard({ icon, label, value, hint, accent = 'primary' }) {
  const accents = {
    primary: 'text-primary bg-surface-container-low',
    secondary: 'text-secondary bg-secondary-fixed/50',
    muted: 'text-on-surface-variant bg-surface-container',
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="label-caps text-on-surface-variant">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accents[accent]}`}>
          <MaterialIcon name={icon} className="text-xl" />
        </span>
      </div>
      <p className="font-display mt-3 text-3xl text-on-surface">{value}</p>
      {hint ? <p className="mt-1 text-xs text-outline">{hint}</p> : null}
    </div>
  )
}

function DashboardPage() {
  const { data, isLoading, error } = useStatsOverview()
  const errorMessage = error?.message || ''

  const maxRevenue = Math.max(...(data?.chartMonths?.map((m) => m.revenue) || [1]), 1)

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-outline-variant/20 bg-surface-container-lowest/70 px-4 py-5 backdrop-blur-xl md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl text-primary md:text-4xl">Tổng quan Boutique</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Dưới đây là thông tin hoạt động kinh doanh hoa tươi ngày hôm nay.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/qr/new" className="btn-glass !py-2.5">
              <MaterialIcon name="qr_code_2" className="text-lg" />
              Tạo QR
            </Link>
            <Link to="/admin/orders/new" className="btn-primary !py-2.5">
              <MaterialIcon name="add" className="text-lg" />
              Tạo đơn
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        {errorMessage ? (
          <p className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
            {errorMessage}
          </p>
        ) : null}

        {isLoading || !data ? (
          <p className="py-16 text-center text-sm text-on-surface-variant">Đang tải thống kê...</p>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                icon="qr_code_2"
                label="Doanh thu hôm nay"
                value={formatMoney(data.today.revenue)}
                hint={`${data.today.orderCount} đơn`}
              />
              <KpiCard
                icon="local_shipping"
                label="Đơn đang xử lý"
                value={String((data.pendingOrders || []).length).padStart(2, '0')}
                hint="Chờ làm / đang giao"
                accent="secondary"
              />
              <KpiCard
                icon="trending_up"
                label="LN ước tính ngày"
                value={formatMoney(data.today.profit)}
                hint={`Cọc: ${formatMoney(data.today.deposit)}`}
              />
              <KpiCard
                icon="account_balance_wallet"
                label="Thu − Chi tháng"
                value={formatMoney(data.month.cashBalance)}
                hint={`Thu ${formatMoney(data.month.cashIncome)} · Chi ${formatMoney(data.month.cashExpense)}`}
                accent="muted"
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="glass-card p-5">
                <h3 className="font-display text-xl text-primary">Tháng này</h3>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="label-caps text-outline">Doanh thu</dt>
                    <dd className="mt-1 text-lg font-semibold text-on-surface">
                      {formatMoney(data.month.revenue)}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-caps text-outline">Số đơn</dt>
                    <dd className="mt-1 text-lg font-semibold text-on-surface">
                      {data.month.orderCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-caps text-outline">LN ước tính</dt>
                    <dd className="mt-1 text-lg font-semibold text-primary">
                      {formatMoney(data.month.profit)}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-caps text-outline">Cọc</dt>
                    <dd className="mt-1 text-lg font-semibold text-on-surface">
                      {formatMoney(data.month.deposit)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="glass-card p-5">
                <h3 className="font-display text-xl text-primary">Năm nay</h3>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="label-caps text-outline">Doanh thu</dt>
                    <dd className="mt-1 text-lg font-semibold text-on-surface">
                      {formatMoney(data.year.revenue)}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-caps text-outline">Số đơn</dt>
                    <dd className="mt-1 text-lg font-semibold text-on-surface">
                      {data.year.orderCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-caps text-outline">LN ước tính</dt>
                    <dd className="mt-1 text-lg font-semibold text-primary">
                      {formatMoney(data.year.profit)}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-caps text-outline">Cọc</dt>
                    <dd className="mt-1 text-lg font-semibold text-on-surface">
                      {formatMoney(data.year.deposit)}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="glass-card p-5">
              <h3 className="font-display text-xl text-primary">Doanh thu 6 tháng gần nhất</h3>
              <div className="mt-4 flex h-44 items-end gap-2">
                {data.chartMonths.map((month) => (
                  <div key={month.key} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-xl bg-primary/75 transition"
                      style={{
                        height: `${Math.max(4, (month.revenue / maxRevenue) * 100)}%`,
                      }}
                      title={formatMoney(month.revenue)}
                    />
                    <span className="text-[10px] text-outline">{month.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="glass-card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl text-primary">Hoạt động gần đây</h3>
                  <Link to="/admin/manage" className="label-caps text-primary hover:text-primary-container">
                    Xem tất cả →
                  </Link>
                </div>
                <ul className="mt-4 divide-y divide-surface-container">
                  {(data.pendingOrders || []).slice(0, 6).map((order) => {
                    const status =
                      ORDER_STATUS_LABELS[order.status] ?? ORDER_STATUS_LABELS.pending
                    return (
                      <li key={order.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-primary">
                            <MaterialIcon name="shopping_bag" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-on-surface">
                              {order.customerName}
                            </p>
                            <p className="font-mono text-[10px] text-outline">
                              {getInvoiceCode(order)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </li>
                    )
                  })}
                  {(data.pendingOrders || []).length === 0 ? (
                    <li className="py-8 text-center text-sm text-outline">Không có đơn chờ</li>
                  ) : null}
                </ul>
              </section>

              <section className="glass-card p-5">
                <h3 className="font-display text-xl text-primary">Sản phẩm nổi bật</h3>
                <ul className="mt-4 space-y-3">
                  {(data.topProducts || []).slice(0, 5).map((product) => (
                    <li
                      key={product.productId || product.productName}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="truncate text-on-surface">
                        {product.productName}
                        <span className="ml-1 text-xs text-outline">×{product.quantity}</span>
                      </span>
                      <span className="shrink-0 font-semibold text-primary">
                        {formatMoney(product.revenue)}
                      </span>
                    </li>
                  ))}
                  {(data.topProducts || []).length === 0 ? (
                    <li className="py-8 text-center text-sm text-outline">Chưa có dữ liệu bán hàng</li>
                  ) : null}
                </ul>

                <div className="mt-5 flex items-center justify-between border-t border-outline-variant/20 pt-4">
                  <h3 className="text-sm font-semibold text-on-surface">Thu chi gần đây</h3>
                  <Link to="/admin/cashbook" className="label-caps text-primary">
                    Sổ quỹ
                  </Link>
                </div>
                <ul className="mt-2 space-y-2">
                  {(data.recentCash || []).slice(0, 5).map((entry) => (
                    <li key={entry.id} className="flex justify-between gap-2 text-sm">
                      <span className="truncate text-on-surface-variant">{entry.content}</span>
                      <span
                        className={
                          entry.type === 'income' ? 'font-medium text-primary' : 'font-medium text-secondary'
                        }
                      >
                        {entry.type === 'income' ? '+' : '−'}
                        {formatMoney(entry.amount)}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to="/admin/products" className="btn-glass mt-5 w-full">
                  Quản lý sản phẩm
                </Link>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
