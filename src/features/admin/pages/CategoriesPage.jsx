import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSWRConfig } from 'swr'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { overlayFade, sheetEnter } from '../../../lib/motion'
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
import { useScrollLock } from '../../../hooks/useScrollLock'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import { swrKeys } from '../../../hooks/swr/keys'
import AdminMobileOverlayShell from '../components/AdminMobileOverlayShell'
import CategoriesListMobile, {
  CategoriesListMobileSkeleton,
} from '../mobile/CategoriesListMobile'

const PAGE_SIZE = 25
const SEARCH_DEBOUNCE_MS = 300
const SCROLL_TOGGLE_DELTA = 8

const inputClass =
  'w-full rounded-xl border border-outline-variant/25 bg-white/50 px-3 py-2.5 text-sm outline-none backdrop-blur-sm focus:ring-2 focus:ring-primary/20'

const EMPTY_FORM = {
  name: '',
  showInQuickFilter: true,
  active: true,
}

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

function CategoryFormDialog({
  open,
  title,
  values,
  onChange,
  onSubmit,
  onClose,
  formError,
  isEditing,
}) {
  useScrollLock(open)
  const nameRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => nameRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [open])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4"
          {...overlayFade}
        >
          <button
            type="button"
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            aria-label="Đóng"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-form-title"
            className="relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl border border-white/50 bg-surface-container-lowest/90 shadow-2xl backdrop-blur-2xl sm:rounded-2xl"
            {...sheetEnter}
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/40 px-5 py-4">
              <div>
                <h3 id="category-form-title" className="text-lg font-semibold text-on-surface">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {isEditing ? 'Cập nhật thông tin danh mục.' : 'Thêm danh mục mới vào hệ thống.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/35 text-outline backdrop-blur-md transition hover:bg-white/60 hover:text-on-surface"
                aria-label="Đóng"
              >
                <MaterialIcon name="close" className="text-xl" />
              </button>
            </div>

            <form
              data-scroll-lock-scrollable
              onSubmit={onSubmit}
              className="max-h-[min(80dvh,var(--app-vvh,80dvh))] space-y-4 overflow-y-auto overscroll-contain px-5 py-4"
            >
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-on-surface">Tên danh mục</span>
                <input
                  ref={nameRef}
                  required
                  value={values.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  placeholder="Ví dụ: Hoa sáp"
                  className={inputClass}
                />
              </label>

              <div className="space-y-2.5 rounded-2xl border border-white/45 bg-white/30 p-3 backdrop-blur-md">
                <label className="flex items-center gap-2.5 text-sm text-on-surface">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={values.showInQuickFilter}
                    onChange={(e) => onChange('showInQuickFilter', e.target.checked)}
                  />
                  Hiện trong lọc nhanh shop
                </label>
                <label className="flex items-center gap-2.5 text-sm text-on-surface">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={values.active}
                    onChange={(e) => onChange('active', e.target.checked)}
                  />
                  Đang dùng
                </label>
              </div>

              {formError ? (
                <p
                  className="rounded-xl bg-red-50/90 px-4 py-3 text-sm text-red-600 backdrop-blur-sm"
                  role="alert"
                >
                  {formError}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-container"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/55 bg-white/40 px-4 py-2.5 text-sm font-medium text-on-surface-variant backdrop-blur-md hover:bg-white/70"
                >
                  Hủy
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function CategoriesPage() {
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
  const [form, setForm] = useState(EMPTY_FORM)
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
    setForm(EMPTY_FORM)
    setFormError('')
  }

  function handleChange(field, value) {
    setFormError('')
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  function openCreate() {
    if (busy) return
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowForm(true)
  }

  function openEdit(category) {
    if (busy) return
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

          {categories.length > 0 ? (
            <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/55 px-4 py-3 backdrop-blur-xl">
              <label className="inline-flex items-center gap-2 text-sm text-on-surface">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                />
                Chọn tất cả ({categories.length})
              </label>
              {selectedCount > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-xl border border-white/55 bg-white/40 px-3 py-2 text-sm font-medium text-on-surface backdrop-blur-md">
                    Đã chọn {selectedCount}
                  </span>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="rounded-xl border border-white/55 bg-white/40 px-3 py-2 text-sm font-medium text-on-surface-variant backdrop-blur-md hover:bg-white/70"
                  >
                    Bỏ chọn
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200/80 bg-red-50/70 px-3 py-2 text-sm font-semibold text-red-600 backdrop-blur-md hover:bg-red-100/80"
                  >
                    <MaterialIcon name="delete" className="text-base" />
                    Xóa đã chọn
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <p className="py-12 text-center text-sm text-on-surface-variant">Đang tải...</p>
          ) : categories.length === 0 ? (
            <div className="glass-card rounded-2xl border border-dashed border-outline-variant/40 px-6 py-16 text-center">
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
            <ul className="space-y-3">
              {categories.map((category) => {
                const checked = selectedIds.includes(category.id)
                return (
                  <li
                    key={category.id}
                    className={[
                      'glass-card flex flex-wrap items-center gap-3 rounded-2xl border border-white/55 px-4 py-3.5 backdrop-blur-xl',
                      !category.active ? 'opacity-60' : '',
                      checked ? 'border-primary/30 bg-primary/5' : '',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={checked}
                      onChange={() => toggleSelect(category.id)}
                      aria-label={`Chọn ${category.name}`}
                    />

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/50 bg-white/35 text-primary backdrop-blur-md">
                      <MaterialIcon name="label" className="text-xl" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-on-surface">
                        {category.name}
                        {!category.active ? (
                          <span className="ml-2 text-xs font-normal text-outline">Đã ẩn</span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-[11px] tracking-wide text-outline">{category.slug}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleToggleQuick(category)}
                        className={[
                          actionBtnClass,
                          category.showInQuickFilter
                            ? 'border-primary/25 bg-primary/15 text-primary'
                            : 'text-on-surface-variant',
                        ].join(' ')}
                        title="Hiện trong lọc nhanh shop"
                        aria-label={
                          category.showInQuickFilter ? 'Ẩn lọc nhanh' : 'Hiện lọc nhanh'
                        }
                      >
                        <MaterialIcon
                          name={category.showInQuickFilter ? 'filter_alt' : 'filter_alt_off'}
                          className="text-base"
                        />
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => openEdit(category)}
                        className={`${actionBtnClass} text-primary`}
                        title="Sửa"
                        aria-label="Sửa"
                      >
                        <MaterialIcon name="edit" className="text-base" />
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleToggleActive(category)}
                        className={`${actionBtnClass} text-on-surface-variant`}
                        title={category.active ? 'Ẩn danh mục' : 'Hiện danh mục'}
                        aria-label={category.active ? 'Ẩn danh mục' : 'Hiện danh mục'}
                      >
                        <MaterialIcon
                          name={category.active ? 'visibility_off' : 'visibility'}
                          className="text-base"
                        />
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDelete(category)}
                        className={`${actionBtnClass} text-red-600 hover:border-red-200 hover:bg-red-50/70`}
                        title="Xóa"
                        aria-label="Xóa"
                      >
                        <MaterialIcon name="delete" className="text-base" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
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
      <AdminMobileOverlayShell backTo="/admin/products">
        {({ requestClose }) => renderMobile(requestClose)}
      </AdminMobileOverlayShell>
    )
  }

  return renderDesktop()
}

export default CategoriesPage
