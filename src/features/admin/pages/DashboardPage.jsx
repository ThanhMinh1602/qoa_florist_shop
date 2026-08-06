import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { useStatsOverview } from '../../../hooks/swr'
import { easeOut, fadeUp, staggerFast } from '../../../lib/motion'
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
    <motion.div className="glass-card p-3.5 lg:p-5" variants={fadeUp} whileHover={{ y: -2 }}>
      <div className="flex items-center justify-between gap-2">
        <p className="label-caps text-[10px] text-on-surface-variant lg:text-xs">{label}</p>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-xl lg:h-9 lg:w-9 ${accents[accent]}`}
        >
          <MaterialIcon name={icon} className="text-lg lg:text-xl" />
        </span>
      </div>
      <p className="font-display mt-2 text-xl leading-tight text-on-surface lg:mt-3 lg:text-3xl">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[10px] text-outline lg:mt-1 lg:text-xs">{hint}</p> : null}
    </motion.div>
  )
}

function DashboardPage() {
  const { data, isLoading, error } = useStatsOverview()
  const errorMessage = error?.message || ''

  const maxRevenue = Math.max(...(data?.chartMonths?.map((m) => m.revenue) || [1]), 1)

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-outline-variant/20 bg-surface-container-lowest/70 px-4 py-3 backdrop-blur-xl lg:px-8 lg:py-5">
        <div className="flex flex-wrap items-center justify-between gap-2.5 lg:items-start lg:gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl text-primary lg:text-4xl">Tổng quan Boutique</h2>
            <p className="mt-0.5 hidden text-sm text-on-surface-variant lg:mt-1 lg:block">
              Dưới đây là thông tin hoạt động kinh doanh hoa tươi ngày hôm nay.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 lg:gap-2">
            <Link to="/admin/qr/new" className="btn-glass !px-3 !py-2 text-[10px] lg:!py-2.5 lg:text-xs">
              <MaterialIcon name="qr_code_2" className="text-lg" />
              <span className="hidden sm:inline">Tạo QR</span>
            </Link>
            <Link to="/admin/orders/new" className="btn-primary !px-3 !py-2 text-[10px] lg:!py-2.5 lg:text-xs">
              <MaterialIcon name="add" className="text-lg" />
              Tạo đơn
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
        {errorMessage ? (
          <p className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
            {errorMessage}
          </p>
        ) : null}

        {isLoading || !data ? (
          <p className="py-16 text-center text-sm text-on-surface-variant">Đang tải thống kê...</p>
        ) : (
          <>
            <motion.section
              className="grid grid-cols-2 gap-2.5 lg:gap-4 xl:grid-cols-4"
              initial="hidden"
              animate="show"
              variants={staggerFast}
            >
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
            </motion.section>

            <motion.section
              className="grid gap-4 lg:grid-cols-2"
              initial="hidden"
              animate="show"
              variants={staggerFast}
            >
              <motion.div className="glass-card p-4 lg:p-5" variants={fadeUp}>
                <h3 className="font-display text-lg text-primary lg:text-xl">Tháng này</h3>
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
              </motion.div>

              <motion.div className="glass-card p-4 lg:p-5" variants={fadeUp}>
                <h3 className="font-display text-lg text-primary lg:text-xl">Năm nay</h3>
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
              </motion.div>
            </motion.section>

            <motion.section
              className="glass-card p-4 lg:p-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: easeOut, delay: 0.08 }}
            >
              <h3 className="font-display text-lg text-primary lg:text-xl">Doanh thu 6 tháng gần nhất</h3>
              <div className="mt-3 flex h-36 items-end gap-1.5 lg:mt-4 lg:h-44 lg:gap-2">
                {data.chartMonths.map((month, index) => (
                  <div key={month.key} className="flex flex-1 flex-col items-center gap-1">
                    <motion.div
                      className="w-full origin-bottom rounded-t-xl bg-primary/75"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.55, delay: 0.12 + index * 0.05, ease: easeOut }}
                      style={{
                        height: `${Math.max(4, (month.revenue / maxRevenue) * 100)}%`,
                      }}
                      title={formatMoney(month.revenue)}
                    />
                    <span className="text-[10px] text-outline">{month.label}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="glass-card p-4 lg:p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg text-primary lg:text-xl">Hoạt động gần đây</h3>
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

              <section className="glass-card p-4 lg:p-5">
                <h3 className="font-display text-lg text-primary lg:text-xl">Sản phẩm nổi bật</h3>
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
