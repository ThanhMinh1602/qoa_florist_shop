import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSWRConfig } from 'swr'
import MaterialIcon from '../../../components/common/MaterialIcon'
import LoadingOverlay from '../../../components/common/LoadingOverlay'
import {
  bulkDeleteCategoriesApi,
  createCategoryApi,
  deleteCategoryApi,
  fetchCategoriesApi,
  updateCategoryApi,
} from '../../../api/categoriesApi'
import { useDialog } from '../../../context/DialogContext'
import { useAdminCategories } from '../../../hooks/swr'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import { swrKeys } from '../../../hooks/swr/keys'
import AdminMobileOverlayShell from '../components/AdminMobileOverlayShell'
import CategoryFormDialog, { EMPTY_CATEGORY_FORM } from '../components/CategoryFormDialog'
import CategoriesListMobile, {
  CategoriesListMobileSkeleton,
} from '../mobile/CategoriesListMobile'

const PAGE_SIZE = 25
const SEARCH_DEBOUNCE_MS = 300
const SCROLL_TOGGLE_DELTA = 8

const actionBtnClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/55 bg-white/40 text-xs font-semibold backdrop-blur-md transition hover:bg-white/70 hover:shadow-sm disabled:opacity-50'

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


function CategoryMoreMenu({ category, disabled, onEdit, onToggleQuick, onToggleActive, onDelete }) {
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
          className="absolute right-0 top-full z-30 mt-1 min-w-[11rem] overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest py-1 shadow-xl shadow-primary/10"
        >
          <button
            type="button"
            role="menuitem"
            disabled={disabled}
            onClick={() => {
              setOpen(false)
              onEdit(category)
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-on-surface hover:bg-surface-container-low disabled:opacity-50"
          >
            <MaterialIcon name="edit" className="text-base text-primary" />
            Sửa
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={disabled}
            onClick={() => {
              setOpen(false)
              onToggleQuick(category)
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-on-surface hover:bg-surface-container-low disabled:opacity-50"
          >
            <MaterialIcon
              name={category.showInQuickFilter ? 'filter_alt_off' : 'filter_alt'}
              className="text-base text-on-surface-variant"
            />
            {category.showInQuickFilter ? 'Ẩn lọc nhanh' : 'Hiện lọc nhanh'}
          </button>
          {category.active ? (
            <button
              type="button"
              role="menuitem"
              disabled={disabled}
              onClick={() => {
                setOpen(false)
                onToggleActive(category)
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-on-surface hover:bg-surface-container-low disabled:opacity-50"
            >
              <MaterialIcon name="visibility_off" className="text-base text-on-surface-variant" />
              Ẩn danh mục
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              disabled={disabled}
              onClick={() => {
                setOpen(false)
                onToggleActive(category)
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-on-surface hover:bg-surface-container-low disabled:opacity-50"
            >
              <MaterialIcon name="visibility" className="text-base text-emerald-700" />
              Hiện danh mục
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            disabled={disabled}
            onClick={() => {
              setOpen(false)
              onDelete(category)
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50/80 disabled:opacity-50"
          >
            <MaterialIcon name="delete" className="text-base" />
            Xóa danh mục
          </button>
        </div>
      ) : null}
    </div>
  )
}

function CategoriesPage() {
  const navigate = useNavigate()
  const { alert, confirm } = useDialog()
  const { mutate: globalMutate } = useSWRConfig()
  const {
    categories,
    isLoading,
    error: categoriesError,
    mutate: mutateCategories,
  } = useAdminCategories()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_CATEGORY_FORM)
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [busyMessage, setBusyMessage] = useState('Đang xử lý...')
  const [selectedIds, setSelectedIds] = useState([])
  const error = categoriesError?.message || ''
  const isLgUp = useIsLgUp()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagedCategories, setPagedCategories] = useState([])
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

  const allSelected =
    categories.length > 0 && categories.every((item) => selectedIds.includes(item.id))
  const selectedCount = selectedIds.length

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

  const loadMobileCategories = useCallback(async () => {
    if (isLgUp) return
    const seq = ++loadSeqRef.current
    setIsLoadingPage(true)
    setPageError('')
    try {
      const result = await fetchCategoriesApi({
        page,
        limit: PAGE_SIZE,
        q: debouncedSearch,
      })
      if (seq !== loadSeqRef.current) return
      const rows = Array.isArray(result.data) ? result.data : []
      setPagedCategories(rows)
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
      setPageError(err.message || 'Không thể tải danh mục.')
    } finally {
      if (seq === loadSeqRef.current) setIsLoadingPage(false)
    }
  }, [isLgUp, page, debouncedSearch])

  useEffect(() => {
    void loadMobileCategories()
  }, [loadMobileCategories, mobileReloadToken])

  const reload = useCallback(async () => {
    await Promise.all([
      mutateCategories(),
      globalMutate(swrKeys.publicCategories),
      globalMutate(swrKeys.products('all')),
    ])
    setMobileReloadToken((token) => token + 1)
  }, [mutateCategories, globalMutate])

  const safePage = Math.min(page, totalPages)
  const pageFrom = total ? (safePage - 1) * PAGE_SIZE + 1 : 0
  const pageTo = Math.min(safePage * PAGE_SIZE, total)
  const pageButtons = useMemo(
    () => buildPageButtons(totalPages, safePage),
    [totalPages, safePage],
  )

  const mobileIds = useMemo(() => pagedCategories.map((item) => item.id), [pagedCategories])
  const allMobileSelected =
    mobileIds.length > 0 && mobileIds.every((id) => selectedIds.includes(id))

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

  function toggleSelect(id) {
    setSelectedIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    )
  }

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : categories.map((item) => item.id))
  }

  function toggleSelectAllMobile() {
    setSelectedIds((previous) => {
      if (allMobileSelected) return previous.filter((id) => !mobileIds.includes(id))
      return [...new Set([...previous, ...mobileIds])]
    })
  }

  function clearSelection() {
    setSelectedIds([])
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_CATEGORY_FORM)
    setFormError('')
  }

  function handleChange(field, value) {
    setFormError('')
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  function openCreate() {
    if (busy) return
    if (!isLgUp) {
      navigate('/admin/categories/new')
      return
    }
    setEditingId(null)
    setForm(EMPTY_CATEGORY_FORM)
    setFormError('')
    setShowForm(true)
  }

  function openEdit(category) {
    if (busy) return
    if (!isLgUp) {
      navigate(`/admin/categories/${category.id}/edit`)
      return
    }
    setEditingId(category.id)
    setForm({
      name: category.name || '',
      showInQuickFilter: category.showInQuickFilter !== false,
      active: category.active !== false,
    })
    setFormError('')
    setShowForm(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (busy) return

    const trimmed = form.name.trim()
    if (!trimmed) {
      setFormError('Vui lòng nhập tên danh mục.')
      return
    }

    const wasEdit = Boolean(editingId)
    const categoryId = editingId
    const payload = {
      name: trimmed,
      showInQuickFilter: form.showInQuickFilter !== false,
      active: form.active !== false,
    }

    closeForm()
    setBusyMessage(wasEdit ? 'Đang cập nhật danh mục...' : 'Đang thêm danh mục...')
    setBusy(true)

    try {
      if (wasEdit) {
        await updateCategoryApi(categoryId, payload)
      } else {
        await createCategoryApi({
          ...payload,
          sortOrder: (categories?.length || 0) + 1,
        })
      }
      await reload()
      setBusy(false)
      await alert({
        title: wasEdit ? 'Đã cập nhật' : 'Đã thêm danh mục',
        message: wasEdit
          ? 'Thông tin danh mục đã được lưu.'
          : 'Danh mục mới đã được thêm.',
        variant: 'success',
      })
    } catch (err) {
      setBusy(false)
      await alert({
        title: wasEdit ? 'Không thể cập nhật' : 'Không thể thêm danh mục',
        message: err.message || 'Thử lại sau.',
        variant: 'error',
      })
    }
  }

  async function handleToggleQuick(category) {
    if (busy) return
    setBusyMessage('Đang cập nhật...')
    setBusy(true)
    try {
      await updateCategoryApi(category.id, {
        showInQuickFilter: !category.showInQuickFilter,
      })
      await reload()
    } catch (err) {
      await alert({
        title: 'Không thể cập nhật',
        message: err.message || 'Thử lại sau.',
        variant: 'error',
      })
    } finally {
      setBusy(false)
    }
  }

  async function handleToggleActive(category) {
    if (busy) return
    setBusyMessage('Đang cập nhật...')
    setBusy(true)
    try {
      await updateCategoryApi(category.id, { active: !category.active })
      await reload()
    } catch (err) {
      await alert({
        title: 'Không thể cập nhật',
        message: err.message || 'Thử lại sau.',
        variant: 'error',
      })
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(category) {
    if (busy) return
    const ok = await confirm({
      title: 'Xóa danh mục',
      message: `Xóa “${category.name}”? Sản phẩm gắn danh mục này sẽ bỏ liên kết.`,
      confirmLabel: 'Xóa',
      variant: 'danger',
    })
    if (!ok) return

    setBusyMessage('Đang xóa danh mục...')
    setBusy(true)
    try {
      await deleteCategoryApi(category.id)
      setSelectedIds((previous) => previous.filter((id) => id !== category.id))
      await reload()
      setBusy(false)
      await alert({
        title: 'Đã xóa',
        message: `“${category.name}” đã được xóa.`,
        variant: 'success',
      })
    } catch (err) {
      setBusy(false)
      await alert({
        title: 'Không thể xóa',
        message: err.message || 'Thử lại sau.',
        variant: 'error',
      })
    }
  }

  async function handleBulkDelete() {
    if (busy || selectedCount === 0) return
    const ok = await confirm({
      title: 'Xóa nhiều danh mục',
      message: `Xóa ${selectedCount} danh mục đã chọn? Sản phẩm gắn các danh mục này sẽ bỏ liên kết.`,
      confirmLabel: `Xóa ${selectedCount} danh mục`,
      variant: 'danger',
    })
    if (!ok) return

    if (editingId && selectedIds.includes(editingId)) {
      closeForm()
    }

    const ids = [...selectedIds]
    setBusyMessage(`Đang xóa ${ids.length} danh mục...`)
    setBusy(true)
    try {
      const result = await bulkDeleteCategoriesApi(ids)
      clearSelection()
      await reload()
      setBusy(false)
      await alert({
        title: 'Đã xóa',
        message: result.message || `Đã xóa ${ids.length} danh mục.`,
        variant: 'success',
      })
    } catch (err) {
      setBusy(false)
      await alert({
        title: 'Không thể xóa',
        message: err.message || 'Thử lại sau.',
        variant: 'error',
      })
    }
  }

  function renderMobile(requestClose) {
    const showTools = toolsOpen
    const listError = pageError || error

    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <header className="shrink-0 border-b border-outline-variant/25 bg-surface-container-lowest">
          <div className="flex items-center gap-2 px-3 py-2">
            {requestClose ? (
              <button
                type="button"
                onClick={requestClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low"
                aria-label="Quay lại"
              >
                <MaterialIcon name="arrow_back" className="text-xl" />
              </button>
            ) : null}
            <h2 className="min-w-0 flex-1 truncate font-display text-base text-primary">
              Danh mục
            </h2>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-container"
              title="Thêm danh mục"
              aria-label="Thêm danh mục"
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
                      disabled={busy}
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
                    placeholder="Tên / slug danh mục…"
                    tabIndex={showTools ? 0 : -1}
                    className="min-w-0 flex-1 rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-2.5 py-1.5 text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {pagedCategories.length > 0 ? (
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
          <p className="mx-2 mt-2 shrink-0 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600" role="alert">
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
            <CategoriesListMobileSkeleton rows={8} />
          ) : (
            <CategoriesListMobile
              categories={pagedCategories}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onEdit={openEdit}
              onToggleQuick={handleToggleQuick}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
              busy={busy}
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

        <LoadingOverlay open={busy} message={busyMessage} />
      </div>
    )
  }

  function renderDesktop() {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-10">
          <header className="flex flex-wrap items-center justify-between gap-2.5 lg:items-end lg:gap-4">
            <div className="min-w-0">
              <h2 className="font-display text-lg text-primary lg:text-3xl">Danh mục sản phẩm</h2>
              <p className="mt-0.5 hidden text-sm text-on-surface-variant lg:mt-1 lg:block lg:text-base">
                Quản lý danh mục — gán cho sản phẩm và dùng làm lọc nhanh trên shop.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="btn-primary inline-flex items-center gap-1.5 !px-3 !py-2 text-[10px] lg:text-xs"
            >
              <MaterialIcon name="add" className="text-lg" />
              Thêm
            </button>
          </header>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {selectedCount > 0 ? (
                <>
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
                </>
              ) : (
                <p className="text-sm text-on-surface-variant">
                  {categories.length} danh mục
                </p>
              )}
            </div>
          </div>

          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <p className="py-12 text-center text-sm text-on-surface-variant">Đang tải...</p>
          ) : categories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest px-6 py-16 text-center">
              <MaterialIcon name="category" className="text-4xl text-outline" />
              <p className="mt-3 text-sm font-medium text-on-surface">Chưa có danh mục</p>
              <button
                type="button"
                onClick={openCreate}
                className="btn-primary mt-5 inline-flex items-center gap-2"
              >
                <MaterialIcon name="add" className="text-lg" />
                Thêm danh mục
              </button>
            </div>
          ) : (
            <div className="glass-card overflow-hidden rounded-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-white/55 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                    <tr>
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          aria-label="Chọn tất cả"
                        />
                      </th>
                      <th className="px-4 py-3">Icon</th>
                      <th className="px-4 py-3">Tên</th>
                      <th className="px-4 py-3">Slug</th>
                      <th className="px-4 py-3">Lọc nhanh</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {categories.map((category) => {
                      const checked = selectedIds.includes(category.id)
                      return (
                        <tr
                          key={category.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => openEdit(category)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              openEdit(category)
                            }
                          }}
                          className={[
                            'cursor-pointer transition-colors hover:bg-surface-container-low/60',
                            !category.active ? 'opacity-50' : '',
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
                              onChange={() => toggleSelect(category.id)}
                              aria-label={`Chọn ${category.name}`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low text-primary">
                              <MaterialIcon name="label" className="text-lg" />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-on-surface">{category.name}</p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-on-surface-variant">
                            {category.slug || '—'}
                          </td>
                          <td className="px-4 py-3">
                            {category.showInQuickFilter ? (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                <MaterialIcon name="filter_alt" className="text-sm" />
                                Có
                              </span>
                            ) : (
                              <span className="text-xs text-on-surface-variant">Không</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {category.active ? (
                              <span className="text-xs font-medium text-emerald-700">Đang hiện</span>
                            ) : (
                              <span className="text-xs font-medium text-outline">Đã ẩn</span>
                            )}
                          </td>
                          <td
                            className="whitespace-nowrap px-4 py-3 text-right"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            <CategoryMoreMenu
                              category={category}
                              disabled={busy}
                              onEdit={openEdit}
                              onToggleQuick={handleToggleQuick}
                              onToggleActive={handleToggleActive}
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
          )}
        </div>

        <CategoryFormDialog
          open={showForm}
          title={editingId ? 'Sửa danh mục' : 'Thêm danh mục'}
          values={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={closeForm}
          formError={formError}
          isEditing={Boolean(editingId)}
        />

        <LoadingOverlay open={busy} message={busyMessage} />
      </div>
    )
  }

  if (!isLgUp) {
    return (
      <>
        <AdminMobileOverlayShell backTo="/admin/products">
          {({ requestClose }) => renderMobile(requestClose)}
        </AdminMobileOverlayShell>
        <Outlet />
      </>
    )
  }

  return (
    <>
      {renderDesktop()}
      <Outlet />
    </>
  )
}

export default CategoriesPage
