import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { importCustomRequestsBulkApi } from '../../../api/customRequestsApi'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import { formatMoney } from '../../../utils/money'
import { parseOrderSheetFromFile } from '../../../utils/parseOrderSheet'
import AdminMobileOverlayShell from '../components/AdminMobileOverlayShell'
import ImportProgressModal from '../components/ImportProgressModal'

const IMPORT_CHUNK_SIZE = 20
const PREVIEW_PAGE_SIZE = 25

function ImportOrdersPage() {
  const isLgUp = useIsLgUp()
  const closeRef = useRef(null)
  const [orders, setOrders] = useState([])
  const [parseErrors, setParseErrors] = useState([])
  const [meta, setMeta] = useState(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [createCashEntry, setCreateCashEntry] = useState(false)
  const [result, setResult] = useState(null)
  const [progress, setProgress] = useState(null)
  const [activeSheet, setActiveSheet] = useState('')
  const [previewPage, setPreviewPage] = useState(1)

  const selectedCount = orders.length

  const sheetTabs = useMemo(() => {
    const counts = new Map()
    orders.forEach((order) => {
      const name = order.sheetName || meta?.sheets?.[0]?.sheetName || 'Sheet1'
      counts.set(name, (counts.get(name) || 0) + 1)
    })
    if (Array.isArray(meta?.sheets) && meta.sheets.length) {
      return meta.sheets
        .map((sheet) => sheet.sheetName)
        .filter((name) => counts.has(name))
        .map((name) => ({ name, count: counts.get(name) }))
    }
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }))
  }, [orders, meta])

  const activeSheetName = activeSheet || sheetTabs[0]?.name || ''

  const sheetOrders = useMemo(() => {
    if (!activeSheetName) return orders
    return orders.filter((order) => (order.sheetName || 'Sheet1') === activeSheetName)
  }, [orders, activeSheetName])

  const totalPages = Math.max(1, Math.ceil(sheetOrders.length / PREVIEW_PAGE_SIZE))
  const safePage = Math.min(previewPage, totalPages)

  const previewRows = useMemo(() => {
    const start = (safePage - 1) * PREVIEW_PAGE_SIZE
    return sheetOrders.slice(start, start + PREVIEW_PAGE_SIZE)
  }, [sheetOrders, safePage])

  const pageFrom = sheetOrders.length ? (safePage - 1) * PREVIEW_PAGE_SIZE + 1 : 0
  const pageTo = Math.min(safePage * PREVIEW_PAGE_SIZE, sheetOrders.length)

  const pageButtons = useMemo(() => {
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
      if (totalPages <= 7) return true
      if (page === 1 || page === totalPages) return true
      return Math.abs(page - safePage) <= 1
    })
    return pages.reduce((acc, page, index, list) => {
      if (index > 0 && page - list[index - 1] > 1) acc.push('…')
      acc.push(page)
      return acc
    }, [])
  }, [totalPages, safePage])

  useEffect(() => {
    if (!sheetTabs.length) {
      setActiveSheet('')
      return
    }
    if (!sheetTabs.some((tab) => tab.name === activeSheet)) {
      setActiveSheet(sheetTabs[0].name)
      setPreviewPage(1)
    }
  }, [sheetTabs, activeSheet])

  const handleFile = useCallback(async (file) => {
    if (!file) return
    setError('')
    setResult(null)
    setIsParsing(true)
    setFileName(file.name)
    setActiveSheet('')
    setPreviewPage(1)
    try {
      const parsed = await parseOrderSheetFromFile(file)
      setOrders(parsed.orders || [])
      setParseErrors(parsed.errors || [])
      setMeta(parsed.meta || null)
      if (!(parsed.orders || []).length) {
        setError(
          parsed.errors?.[0] ||
            'Không đọc được đơn nào. Hãy export CSV/Excel từ Google Sheet ĐƠN HÀNG QOA.',
        )
      }
    } catch (err) {
      setOrders([])
      setParseErrors([])
      setMeta(null)
      setError(err.message || 'Không đọc được file.')
    } finally {
      setIsParsing(false)
    }
  }, [])

  async function handleImport() {
    if (!orders.length) return
    const total = orders.length
    setError('')
    setIsImporting(true)
    setResult(null)
    setProgress({
      total,
      done: 0,
      createdCount: 0,
      errorCount: 0,
      phase: 'importing',
      currentLabel: `Chuẩn bị import ${total} đơn…`,
    })

    const aggregated = {
      createdCount: 0,
      errorCount: 0,
      errors: [],
    }

    try {
      for (let offset = 0; offset < total; offset += IMPORT_CHUNK_SIZE) {
        const chunk = orders.slice(offset, offset + IMPORT_CHUNK_SIZE)
        const from = offset + 1
        const to = offset + chunk.length
        setProgress((prev) => ({
          ...prev,
          phase: 'importing',
          currentLabel: `Đang import đơn ${from}–${to} / ${total}…`,
        }))

        const payload = await importCustomRequestsBulkApi({
          orders: chunk,
          createCashEntry,
        })
        const data = payload.data || {}
        aggregated.createdCount += Number(data.createdCount) || 0
        aggregated.errorCount += Number(data.errorCount) || 0
        if (Array.isArray(data.errors) && data.errors.length) {
          aggregated.errors.push(...data.errors)
        }

        setProgress({
          total,
          done: to,
          createdCount: aggregated.createdCount,
          errorCount: aggregated.errorCount,
          phase: 'importing',
          currentLabel: `Đã xong ${to}/${total} đơn`,
        })
      }

      setProgress((prev) => ({
        ...prev,
        done: total,
        phase: 'done',
        currentLabel: `Thành công ${aggregated.createdCount} đơn`,
      }))
      setResult(aggregated)
      if (aggregated.createdCount > 0) {
        setOrders([])
        setActiveSheet('')
        setPreviewPage(1)
      }

      window.setTimeout(() => setProgress(null), 900)
    } catch (err) {
      setProgress((prev) => ({
        ...(prev || { total, done: 0, createdCount: 0, errorCount: 0 }),
        phase: 'error',
        currentLabel: err.message || 'Import thất bại.',
      }))
      setError(err.message || 'Import thất bại.')
      if (aggregated.createdCount > 0 || aggregated.errorCount > 0) {
        setResult(aggregated)
      }
      window.setTimeout(() => setProgress(null), 1600)
    } finally {
      setIsImporting(false)
    }
  }

  function clearPreview() {
    setOrders([])
    setParseErrors([])
    setMeta(null)
    setFileName('')
    setResult(null)
    setActiveSheet('')
    setPreviewPage(1)
  }

  const page = (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-outline-variant/25 bg-surface-container-lowest/90 px-3 py-2.5 backdrop-blur lg:px-8 lg:py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {!isLgUp ? (
              <button
                type="button"
                onClick={() => closeRef.current?.()}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low"
                aria-label="Quay lại"
              >
                <MaterialIcon name="arrow_back" className="text-xl" />
              </button>
            ) : null}
            <div className="min-w-0">
              <h2 className="font-display text-base text-primary lg:text-2xl">Import đơn từ Sheet</h2>
              <p className="mt-0.5 hidden text-xs text-on-surface-variant lg:block lg:text-sm">
                Nhập file CSV/Excel export từ sổ ĐƠN HÀNG QOA (Tháng 7 / Tháng 8).
              </p>
            </div>
          </div>
          {isLgUp ? (
            <Link
              to="/admin/manage"
              className="rounded-xl border border-outline-variant/40 px-3 py-2 text-xs font-medium text-primary hover:bg-surface-container-low"
            >
              Về quản lý đơn
            </Link>
          ) : (
            <Link
              to="/admin/manage"
              className="inline-flex h-8 items-center rounded-lg border border-outline-variant/40 px-2.5 text-[11px] font-medium text-primary"
            >
              Đơn hàng
            </Link>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-6xl space-y-4 p-3 md:p-5 lg:p-6">
        <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-on-surface">1. Chuẩn bị file</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-on-surface-variant">
            <li>Mở Google Sheet ĐƠN HÀNG QOA</li>
            <li>
              <strong className="text-on-surface">File → Tải xuống → Microsoft Excel (.xlsx)</strong>{' '}
              (khuyến nghị — lấy đủ mọi tab Tháng 7/8)
            </li>
            <li>CSV cũng được, nhưng nếu báo lỗi tiêu đề hãy dùng lại .xlsx</li>
            <li>Không dùng PDF</li>
          </ol>
        </section>

        <section className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-8 text-center transition hover:border-primary/40">
            <MaterialIcon name="upload_file" className="text-3xl text-primary" />
            <span className="text-sm font-semibold text-on-surface">
              {isParsing ? 'Đang đọc file…' : 'Chọn file .xlsx / .xls / .csv'}
            </span>
            <span className="text-xs text-on-surface-variant">
              {fileName || 'Tối đa ~300 đơn / lần'}
            </span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv,.tsv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              disabled={isParsing || isImporting}
              onChange={(event) => {
                const file = event.target.files?.[0]
                void handleFile(file)
                event.target.value = ''
              }}
            />
          </label>

          {meta ? (
            <p className="mt-2 text-center text-xs text-on-surface-variant">
              Sheet “{meta.sheetName}” · nhận {selectedCount} đơn
              {meta.sheets?.length > 1 ? ` (${meta.sheets.length} tab)` : ''}
            </p>
          ) : null}
        </section>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {parseErrors.length ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold">Cảnh báo khi đọc ({parseErrors.length})</p>
            <ul className="mt-1 max-h-28 list-disc overflow-y-auto pl-5 text-xs">
              {parseErrors.slice(0, 20).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {result ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <p className="font-semibold">
              Đã import {result.createdCount} đơn
              {result.errorCount ? ` · lỗi ${result.errorCount}` : ''}.
            </p>
            {result.errors?.length ? (
              <ul className="mt-1 max-h-28 list-disc overflow-y-auto pl-5 text-xs">
                {result.errors.map((item) => (
                  <li key={`${item.row}-${item.message}`}>
                    Dòng {item.row}: {item.message}
                  </li>
                ))}
              </ul>
            ) : null}
            <Link to="/admin/manage" className="mt-2 inline-flex text-xs font-semibold underline">
              Xem danh sách đơn
            </Link>
          </div>
        ) : null}

        {orders.length > 0 ? (
          <section className="overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 px-3 py-2.5">
              <h3 className="text-sm font-semibold text-on-surface">
                2. Xem trước ({selectedCount} đơn)
              </h3>
              <label className="inline-flex items-center gap-2 text-xs text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={createCashEntry}
                  onChange={(e) => setCreateCashEntry(e.target.checked)}
                />
                Ghi sổ thu nếu có cọc
              </label>
            </div>

            {sheetTabs.length > 0 ? (
              <div className="flex gap-1 overflow-x-auto border-b border-outline-variant/20 px-2 py-2">
                {sheetTabs.map((tab) => {
                  const active = tab.name === activeSheetName
                  return (
                    <button
                      key={tab.name}
                      type="button"
                      onClick={() => {
                        setActiveSheet(tab.name)
                        setPreviewPage(1)
                      }}
                      className={[
                        'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                        active
                          ? 'bg-primary text-white'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high',
                      ].join(' ')}
                    >
                      {tab.name}
                      <span className={active ? 'ml-1 opacity-90' : 'ml-1 opacity-70'}>
                        ({tab.count})
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : null}

            <div className="max-h-[min(55vh,32rem)] overflow-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="sticky top-0 bg-surface-container-low text-on-surface-variant">
                  <tr>
                    <th className="px-2 py-2 font-medium">#</th>
                    <th className="px-2 py-2 font-medium">KH</th>
                    <th className="px-2 py-2 font-medium">SĐT</th>
                    <th className="px-2 py-2 font-medium">SP</th>
                    <th className="px-2 py-2 font-medium">Tổng</th>
                    <th className="px-2 py-2 font-medium">Cọc</th>
                    <th className="px-2 py-2 font-medium">Ship</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((order, index) => (
                    <tr
                      key={`${activeSheetName}-${order.rowLabel}-${pageFrom + index}`}
                      className="border-t border-outline-variant/15"
                    >
                      <td className="px-2 py-1.5 text-on-surface-variant">{order.rowLabel}</td>
                      <td className="max-w-[8rem] truncate px-2 py-1.5 font-medium text-on-surface">
                        {order.customerName}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-on-surface-variant">
                        {order.customerPhone || '—'}
                      </td>
                      <td className="max-w-[12rem] truncate px-2 py-1.5 text-on-surface-variant">
                        {(order.items || []).map((item) => item.productName).join(', ') || '—'}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        {formatMoney(order.subtotal || 0)}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        {formatMoney(order.deposit || 0)}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        {formatMoney(order.shippingFee || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/20 px-3 py-2.5">
              <p className="text-xs text-on-surface-variant">
                {activeSheetName ? (
                  <>
                    Tab <span className="font-medium text-on-surface">{activeSheetName}</span>
                    {' · '}
                  </>
                ) : null}
                Hiện {pageFrom}–{pageTo} / {sheetOrders.length} đơn
                {totalPages > 1 ? ` · trang ${safePage}/${totalPages}` : ''}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPreviewPage((page) => Math.max(1, page - 1))}
                  className="rounded-lg border border-outline-variant/40 px-2.5 py-1.5 text-xs font-medium text-on-surface disabled:opacity-40"
                >
                  Trước
                </button>
                {pageButtons.map((item, index) =>
                  item === '…' ? (
                    <span key={`gap-${index}`} className="px-1 text-xs text-on-surface-variant">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPreviewPage(item)}
                      className={[
                        'min-w-8 rounded-lg px-2 py-1.5 text-xs font-medium',
                        item === safePage
                          ? 'bg-primary text-white'
                          : 'border border-outline-variant/40 text-on-surface hover:bg-surface-container-low',
                      ].join(' ')}
                    >
                      {item}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPreviewPage((page) => Math.min(totalPages, page + 1))}
                  className="rounded-lg border border-outline-variant/40 px-2.5 py-1.5 text-xs font-medium text-on-surface disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-outline-variant/20 px-3 py-3">
              <button
                type="button"
                onClick={clearPreview}
                className="rounded-xl border border-outline-variant/40 px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
              >
                Xóa preview
              </button>
              <button
                type="button"
                disabled={isImporting}
                onClick={() => void handleImport()}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-container disabled:opacity-60"
              >
                {isImporting ? 'Đang import…' : `Import ${selectedCount} đơn`}
              </button>
            </div>
          </section>
        ) : null}
        </div>
      </div>

      <ImportProgressModal
        open={Boolean(progress)}
        total={progress?.total || 0}
        done={progress?.done || 0}
        createdCount={progress?.createdCount || 0}
        errorCount={progress?.errorCount || 0}
        phase={progress?.phase || 'importing'}
        currentLabel={progress?.currentLabel || ''}
      />
    </div>
  )

  if (!isLgUp) {
    return (
      <AdminMobileOverlayShell backTo="/admin/manage">
        {({ requestClose }) => {
          closeRef.current = requestClose
          return page
        }}
      </AdminMobileOverlayShell>
    )
  }

  return page
}

export default ImportOrdersPage
