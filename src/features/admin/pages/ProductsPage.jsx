import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import LoadingOverlay from '../../../components/common/LoadingOverlay'
import {
  activateProductApi,
  bulkDeleteProductsApi,
  deactivateProductApi,
  deleteProductApi,
  fetchProductsApi,
} from '../../../api/productsApi'
import { useDialog } from '../../../context/DialogContext'
import { useProducts } from '../../../hooks/swr'
import { formatMoney } from '../../../utils/money'
import { cloudinaryUrl } from '../../../utils/cloudinaryUrl'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import ProductColorSwatches from '../components/ProductColorSwatches'
import ProductsListMobile, { ProductsListMobileSkeleton } from '../mobile/ProductsListMobile'

const PAGE_SIZE = 25
const SEARCH_DEBOUNCE_MS = 300
const SCROLL_TOGGLE_DELTA = 8

function buildPageButtons(totalPages, safePage) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
    if (totalPages <= 5) return true
    if (page === 1 || page === totalPages) return true
    return Math.abs(page - safePage) <= 1
  })
  return pages.reduce((acc, page, index, list) => {
    if (index > 0 && page - list[index - 1] > 1) acc.push('…')
    acc.push(page)
    return acc
  }, [])
}

const actionBtnClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/55 bg-white/40 text-xs font-semibold backdrop-blur-md transition hover:bg-white/70 hover:shadow-sm disabled:opacity-50'


function ProductMoreMenu({ product, disabled, onHide, onShow, onDelete }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className={`${actionBtnClass} text-on-surface-variant`}
        title="Thêm"
        aria-label="Thêm thao tác"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MaterialIcon name="more_vert" className="text-base" />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest py-1 shadow-xl shadow-primary/10"
        >
          {product.active ? (
            <button
              type="button"
              role="menuitem"
              disabled={disabled}
              onClick={() => {
                setOpen(false)
                onHide(product)
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-on-surface hover:bg-surface-container-low disabled:opacity-50"
            >
              <MaterialIcon name="visibility_off" className="text-base text-on-surface-variant" />
              Ẩn sản phẩm
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              disabled={disabled}
              onClick={() => {
                setOpen(false)
                onShow(product)
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-on-surface hover:bg-surface-container-low disabled:opacity-50"
            >
              <MaterialIcon name="visibility" className="text-base text-emerald-700" />
              Hiện sản phẩm
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            disabled={disabled}
            onClick={() => {
              setOpen(false)
              onDelete(product)
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50/80 disabled:opacity-50"
          >
            <MaterialIcon name="delete" className="text-base" />
            Xóa sản phẩm
          </button>
        </div>
      ) : null}
    </div>
  )
}

function ProductActionButtons({ product, disabled, onToggleActive, onDelete }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <ProductMoreMenu
        product={product}
        disabled={disabled}
        onHide={(item) => onToggleActive(item, false)}
        onShow={(item) => onToggleActive(item, true)}
        onDelete={onDelete}
      />
    </div>
  )
}

function ProductThumb({ product }) {
  const src = product.mainImage || product.images?.find((image) => image.isMain)?.url || product.images?.[0]?.url
  if (!src) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low text-primary-fixed-dim">
        <MaterialIcon name="image" className="text-lg" />
      </div>
    )
  }
  return (
    <img
      src={cloudinaryUrl(src, { width: 80 })}
      alt=""
      className="h-10 w-10 rounded-lg object-cover"
      loading="lazy"
      decoding="async"
    />
  )
}

function ProductsPage() {
  const navigate = useNavigate()
  const { alert, confirm } = useDialog()
  const {
    products,
    isLoading,
    error: productsError,
    mutate: mutateProducts,
  } = useProducts()
  const [isBusy, setIsBusy] = useState(false)
  const [busyMessage, setBusyMessage] = useState('Đang xử lý...')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const isLgUp = useIsLgUp()
  const error = productsError?.message || ''

  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [pagedProducts, setPagedProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoadingPage, setIsLoadingPage] = useState(true)
  const [pageError, setPageError] = useState('')
  const [mobileReloadToken, setMobileReloadToken] = useState(0)
  const loadSeqRef = useRef(0)
  const listScrollRef = useRef(null)
  const skipScrollOnMount = useRef(true)
  const lastScrollTopRef = useRef(0)
  const [toolsOpen, setToolsOpen] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = search.trim()
      setDebouncedSearch((prev) => {
        if (prev !== next) setPage(1)
        return next
      })
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  const loadMobileProducts = useCallback(async () => {
    if (isLgUp) return
    const seq = ++loadSeqRef.current
    setIsLoadingPage(true)
    setPageError('')
    try {
      const result = await fetchProductsApi({
        page,
        limit: PAGE_SIZE,
        q: debouncedSearch,
      })
      if (seq !== loadSeqRef.current) return
      const rows = Array.isArray(result.data) ? result.data : []
      setPagedProducts(rows)
      const pagination = result.pagination || {}
      const nextTotal = pagination.total != null ? Number(pagination.total) : rows.length
      const nextTotalPages =
        pagination.totalPages != null
          ? Math.max(1, Number(pagination.totalPages))
          : Math.max(1, Math.ceil(nextTotal / PAGE_SIZE))
      setTotal(Number.isFinite(nextTotal) ? nextTotal : rows.length)
      setTotalPages(Number.isFinite(nextTotalPages) ? nextTotalPages : 1)
      if (page > nextTotalPages) setPage(nextTotalPages)
    } catch (err) {
      if (seq !== loadSeqRef.current) return
      setPageError(err.message || 'Không thể tải danh sách.')
    } finally {
      if (seq === loadSeqRef.current) setIsLoadingPage(false)
    }
  }, [isLgUp, page, debouncedSearch])

  useEffect(() => {
    void loadMobileProducts()
  }, [loadMobileProducts, mobileReloadToken])

  const load = useCallback(async () => {
    await mutateProducts()
    setMobileReloadToken((token) => token + 1)
  }, [mutateProducts])

  const safePage = Math.min(page, totalPages)
  const pageFrom = total ? (safePage - 1) * PAGE_SIZE + 1 : 0
  const pageTo = Math.min(safePage * PAGE_SIZE, total)
  const pageButtons = useMemo(
    () => buildPageButtons(totalPages, safePage),
    [totalPages, safePage],
  )

  useEffect(() => {
    if (isLgUp || skipScrollOnMount.current) {
      skipScrollOnMount.current = false
      return
    }
    listScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    setToolsOpen(true)
    lastScrollTopRef.current = 0
  }, [safePage, isLgUp])

  useEffect(() => {
    if (isLgUp) {
      setToolsOpen(true)
      return undefined
    }
    const el = listScrollRef.current
    if (!el) return undefined
    const onScroll = () => {
      const top = el.scrollTop
      const delta = top - lastScrollTopRef.current
      lastScrollTopRef.current = top
      if (top <= 12) {
        setToolsOpen(true)
        return
      }
      if (delta > SCROLL_TOGGLE_DELTA) setToolsOpen(false)
      else if (delta < -SCROLL_TOGGLE_DELTA) setToolsOpen(true)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [isLgUp, isLoadingPage])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return products
    return products.filter((item) =>
      [item.code, item.name, item.description, ...(item.categories || []).map((c) => c.name)]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    )
  }, [products, search])

  const mobileList = isLgUp ? filtered : pagedProducts
  const mobileIds = useMemo(() => mobileList.map((item) => item.id), [mobileList])
  const allMobileSelected =
    mobileIds.length > 0 && mobileIds.every((id) => selectedIds.includes(id))

  const filteredIds = useMemo(() => filtered.map((item) => item.id), [filtered])
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id))
  const selectedCount = selectedIds.length

  function toggleSelect(id) {
    setSelectedIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    )
  }

  function toggleSelectAllMobile() {
    setSelectedIds((previous) => {
      if (allMobileSelected) {
        return previous.filter((id) => !mobileIds.includes(id))
      }
      return [...new Set([...previous, ...mobileIds])]
    })
  }

  function toggleSelectAllFiltered() {
    setSelectedIds((previous) => {
      if (allFilteredSelected) {
        return previous.filter((id) => !filteredIds.includes(id))
      }
      return [...new Set([...previous, ...filteredIds])]
    })
  }

  function clearSelection() {
    setSelectedIds([])
  }





  function openCreate() {
    if (isBusy) return
    navigate('/admin/products/new')
  }

  function openEdit(product) {
    if (isBusy) return
    navigate(`/admin/products/${product.id}`)
  }




  async function handleDeactivate(product) {
    if (isBusy) return
    const ok = await confirm({
      title: 'Ẩn sản phẩm',
      message: `Ẩn “${product.name}”? Sản phẩm vẫn còn trong danh sách, chỉ không hiện trên shop.`,
      confirmLabel: 'Ẩn',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await deactivateProductApi(product.id)
      await load()
    } catch (err) {
      await alert({
        title: 'Không thể cập nhật',
        message: err.message || 'Không thể cập nhật.',
        variant: 'error',
      })
    }
  }

  async function handleActivate(product) {
    if (isBusy) return
    try {
      await activateProductApi(product.id)
      await load()
    } catch (err) {
      await alert({
        title: 'Không thể cập nhật',
        message: err.message || 'Không thể cập nhật.',
        variant: 'error',
      })
    }
  }

  async function handleDelete(product) {
    if (isBusy) return
    const ok = await confirm({
      title: 'Xóa sản phẩm',
      message: `Xóa mềm “${product.name}”? Sản phẩm sẽ biến mất khỏi danh sách quản lý và shop (không xóa vĩnh viễn).`,
      confirmLabel: 'Xóa',
      variant: 'danger',
    })
    if (!ok) return


    setBusyMessage('Đang xóa sản phẩm...')
    setIsBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 80))
    try {
      await deleteProductApi(product.id)
      setSelectedIds((previous) => previous.filter((id) => id !== product.id))
      await load()
      setIsBusy(false)
      await alert({
        title: 'Đã xóa',
        message: `“${product.name}” đã được xóa mềm.`,
        variant: 'success',
      })
    } catch (err) {
      setIsBusy(false)
      await alert({
        title: 'Không thể xóa',
        message: err.message || 'Không thể xóa.',
        variant: 'error',
      })
    }
  }

  async function handleBulkDelete() {
    if (isBusy || selectedIds.length === 0) return
    const ok = await confirm({
      title: 'Xóa nhiều sản phẩm',
      message: `Xóa mềm ${selectedIds.length} sản phẩm đã chọn? Chúng sẽ biến mất khỏi danh sách quản lý và shop.`,
      confirmLabel: `Xóa ${selectedIds.length} sản phẩm`,
      variant: 'danger',
    })
    if (!ok) return


    const ids = [...selectedIds]
    setBusyMessage(`Đang xóa ${ids.length} sản phẩm...`)
    setIsBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 80))
    try {
      const result = await bulkDeleteProductsApi(ids)
      clearSelection()
      await load()
      setIsBusy(false)
      await alert({
        title: 'Đã xóa',
        message: result.message || `Đã xóa mềm ${ids.length} sản phẩm.`,
        variant: 'success',
      })
    } catch (err) {
      setIsBusy(false)
      await alert({
        title: 'Không thể xóa',
        message: err.message || 'Không thể xóa.',
        variant: 'error',
      })
    }
  }


  // Mobile: shell giống đơn hàng — header / list / pagination
  if (!isLgUp) {
    const iconBtn =
      'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/40 text-primary hover:bg-surface-container-low'
    const showTools = toolsOpen
    const listError = pageError || error

    return (
      <>
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
          <header className="shrink-0 border-b border-outline-variant/25 bg-surface-container-lowest">
            <div className="flex items-center gap-2 px-3 py-2">
              <h2 className="min-w-0 flex-1 truncate font-display text-base text-primary">
                Sản phẩm
              </h2>
              <Link to="/admin/categories" className={iconBtn} title="Danh mục" aria-label="Danh mục">
                <MaterialIcon name="category" className="text-lg" />
              </Link>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-container"
                title="Thêm sản phẩm"
                aria-label="Thêm sản phẩm"
              >
                <MaterialIcon name="add" className="text-lg" />
              </button>
            </div>

            <div
              className={[
                'grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
                showTools
                  ? 'grid-rows-[1fr] opacity-100'
                  : 'pointer-events-none grid-rows-[0fr] opacity-0',
              ].join(' ')}
              aria-hidden={!showTools}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="space-y-1.5 border-t border-outline-variant/20 px-2 pb-2 pt-1.5">
                  {selectedCount > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-on-surface-variant">{selectedCount} chọn</span>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="rounded-md px-2 py-1 text-[11px] text-on-surface-variant hover:bg-surface-container-low"
                      >
                        Bỏ
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void handleBulkDelete()}
                        className="rounded-md bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 disabled:opacity-50"
                      >
                        Xóa
                      </button>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Mã / tên sản phẩm…"
                      tabIndex={showTools ? 0 : -1}
                      className="min-w-0 flex-1 rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-2.5 py-1.5 text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {pagedProducts.length > 0 ? (
                      <label className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] text-on-surface-variant">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-outline-variant"
                          checked={allMobileSelected}
                          onChange={toggleSelectAllMobile}
                        />
                        Tất cả
                      </label>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {listError ? (
            <p
              className="mx-2 mt-2 shrink-0 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
              role="alert"
            >
              {listError}
            </p>
          ) : null}

          <div
            ref={listScrollRef}
            data-scroll-lock-scrollable
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pt-2 touch-pan-y [-webkit-overflow-scrolling:touch]"
            aria-busy={isLoadingPage || undefined}
          >
            {isLoadingPage ? (
              <ProductsListMobileSkeleton rows={8} />
            ) : (
              <ProductsListMobile
                products={pagedProducts}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onSelect={openEdit}
                onHide={handleDeactivate}
                onShow={handleActivate}
                onDelete={handleDelete}
                busy={isBusy}
              />
            )}
          </div>

          {total > 0 ? (
            <div className="relative z-10 mt-auto shrink-0 border-t border-outline-variant/25 bg-surface-container-lowest">
              <div className="flex items-center justify-between gap-2 px-2 py-2">
                <p className="text-[11px] text-on-surface-variant">
                  {pageFrom}–{pageTo}/{total}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={safePage <= 1 || isLoadingPage}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="rounded-md border border-outline-variant/40 px-2 py-1 text-[11px] disabled:opacity-40"
                  >
                    ‹
                  </button>
                  {pageButtons.map((item, index) =>
                    item === '…' ? (
                      <span key={`gap-${index}`} className="px-0.5 text-[11px] text-outline">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        disabled={isLoadingPage}
                        onClick={() => setPage(item)}
                        className={[
                          'min-w-6 rounded-md px-1.5 py-1 text-[11px] font-medium',
                          item === safePage
                            ? 'bg-primary text-white'
                            : 'border border-outline-variant/40 text-on-surface',
                        ].join(' ')}
                      >
                        {item}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    disabled={safePage >= totalPages || isLoadingPage}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    className="rounded-md border border-outline-variant/40 px-2 py-1 text-[11px] disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <LoadingOverlay open={isBusy} message={busyMessage} />
      </>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-10">
        <header className="flex flex-wrap items-center justify-between gap-2.5 lg:items-end lg:gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-lg text-primary lg:text-3xl">Quản lý sản phẩm</h2>
            <p className="mt-0.5 hidden text-sm text-on-surface-variant lg:mt-1 lg:block lg:text-base">
              Tổng quan và tùy chỉnh bộ sưu tập hoa.
            </p>
          </div>
          {isLgUp ? (
            <div className="flex items-center gap-2">
              <Link
                to="/admin/categories"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-outline-variant/40 px-3 text-xs font-semibold text-primary hover:bg-surface-container-low"
              >
                <MaterialIcon name="category" className="text-lg" />
                Danh mục
              </Link>
              <button
                type="button"
                onClick={openCreate}
                className="btn-primary inline-flex items-center gap-1.5 !px-3 !py-2 text-xs"
              >
                <MaterialIcon name="add" className="text-lg" />
                Thêm
              </button>
            </div>
          ) : null}
        </header>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã, tên..."
            className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface outline-none ring-primary/20 transition focus:ring-2 lg:max-w-md"
          />
          {selectedCount > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-sm font-medium text-on-surface">
                Đã chọn {selectedCount}
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
              >
                Bỏ chọn
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200/80 bg-red-50/70 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100/80"
              >
                <MaterialIcon name="delete" className="text-base" />
                Xóa đã chọn
              </button>
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <p className="py-12 text-center text-sm text-on-surface-variant">Đang tải...</p>
        ) : filtered.length === 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-end lg:hidden">
              <button
                type="button"
                onClick={openCreate}
                className="btn-primary inline-flex h-9 w-9 items-center justify-center !p-0"
                title="Thêm sản phẩm"
                aria-label="Thêm sản phẩm"
              >
                <MaterialIcon name="add" className="text-xl" />
              </button>
            </div>
            <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest px-6 py-16 text-center">
              <MaterialIcon name="inventory_2" className="text-4xl text-outline" />
              <p className="mt-3 text-sm font-medium text-on-surface">Chưa có sản phẩm</p>
            </div>
          </div>
        ) : isLgUp ? (
          <div className="glass-card overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/55 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAllFiltered}
                        aria-label="Chọn tất cả"
                      />
                    </th>
                    <th className="px-4 py-3">Ảnh</th>
                    <th className="px-4 py-3">Mã</th>
                    <th className="px-4 py-3">Tên</th>
                    <th className="px-4 py-3">Danh mục</th>
                    <th className="px-4 py-3">Giá vốn</th>
                    <th className="px-4 py-3">Giá bán</th>
                    <th className="px-4 py-3">Lợi nhuận</th>
                    <th className="px-4 py-3">Đã bán</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {filtered.map((product) => {
                    const checked = selectedIds.includes(product.id)
                    return (
                      <tr
                        key={product.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openEdit(product)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            openEdit(product)
                          }
                        }}
                        className={[
                          'cursor-pointer transition-colors hover:bg-surface-container-low/60',
                          !product.active ? 'opacity-50' : '',
                          checked ? 'bg-primary/5' : '',
                        ].join(' ')}
                      >
                        <td
                          className="px-4 py-3"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="accent-primary"
                            checked={checked}
                            onChange={() => toggleSelect(product.id)}
                            aria-label={`Chọn ${product.name}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <ProductThumb product={product} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold">
                          {product.code}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-on-surface">{product.name}</p>
                          <ProductColorSwatches colors={product.colors} className="max-w-xs" />
                        </td>
                        <td className="max-w-[180px] px-4 py-3 text-xs text-on-surface-variant">
                          {(product.categories || []).length
                            ? product.categories.map((item) => item.name).join(', ')
                            : '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">{formatMoney(product.costPrice)}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-medium">
                          {formatMoney(product.sellPrice)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-emerald-700">
                          {formatMoney(product.profit)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-on-surface">
                          {product.soldCount || 0}
                        </td>
                        <td
                          className="whitespace-nowrap px-4 py-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <ProductActionButtons
                            product={product}
                            disabled={isBusy}
                            onToggleActive={(item, active) =>
                              active ? handleActivate(item) : handleDeactivate(item)
                            }
                            onDelete={handleDelete}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="glass-card inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-on-surface">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAllFiltered}
                />
                Chọn tất cả ({filtered.length})
              </label>
              <button
                type="button"
                onClick={openCreate}
                className="btn-primary inline-flex h-9 w-9 shrink-0 items-center justify-center !p-0"
                title="Thêm sản phẩm"
                aria-label="Thêm sản phẩm"
              >
                <MaterialIcon name="add" className="text-xl" />
              </button>
            </div>
            {filtered.map((product) => {
              const checked = selectedIds.includes(product.id)
              return (
                <div
                  key={product.id}
                  className={[
                    'rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-3 shadow-sm',
                    !product.active ? 'opacity-60' : '',
                    checked ? 'border-primary/30 bg-primary/5' : '',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      className="shrink-0 accent-primary"
                      checked={checked}
                      onChange={() => toggleSelect(product.id)}
                      aria-label={`Chọn ${product.name}`}
                    />
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                    >
                      <ProductThumb product={product} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-on-surface">
                          {product.name}
                        </p>
                        <ProductColorSwatches colors={product.colors} />
                        <p className="mt-0.5 text-sm font-semibold text-primary">
                          {formatMoney(product.sellPrice)}
                        </p>
                        {!product.active ? (
                          <p className="mt-0.5 text-[11px] font-medium text-on-surface-variant">
                            Đã ẩn
                          </p>
                        ) : null}
                      </div>
                    </button>
                    <ProductMoreMenu
                      product={product}
                      disabled={isBusy}
                      onHide={handleDeactivate}
                      onShow={handleActivate}
                      onDelete={handleDelete}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>


      <LoadingOverlay open={isBusy} message={busyMessage} />
    </div>
  )
}

export default ProductsPage

