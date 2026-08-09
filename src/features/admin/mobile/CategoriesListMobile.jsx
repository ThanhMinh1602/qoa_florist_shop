import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'

const MENU_WIDTH = 168
const MENU_EST_HEIGHT = 140

function CategoryMoreMenu({
  category,
  disabled,
  onEdit,
  onToggleQuick,
  onToggleActive,
  onDelete,
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, openUp: false })
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < MENU_EST_HEIGHT + 12
    const left = Math.min(
      Math.max(8, rect.right - MENU_WIDTH),
      window.innerWidth - MENU_WIDTH - 8,
    )
    const top = openUp ? rect.top - 4 : rect.bottom + 4
    setCoords({ top, left, openUp })
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    function close() {
      setOpen(false)
    }

    function onPointerDown(event) {
      const target = event.target
      if (buttonRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      close()
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [open])

  function runAction(action) {
    setOpen(false)
    action?.(category)
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
        aria-label="Thêm thao tác"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MaterialIcon name="more_vert" className="text-base" />
      </button>

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={{
                position: 'fixed',
                top: coords.openUp ? undefined : coords.top,
                bottom: coords.openUp ? window.innerHeight - coords.top : undefined,
                left: coords.left,
                width: MENU_WIDTH,
                zIndex: 100,
              }}
              className="overflow-hidden rounded-lg border border-outline-variant/25 bg-surface-container-lowest py-1 shadow-xl shadow-primary/15"
            >
              <button
                type="button"
                role="menuitem"
                disabled={disabled}
                onClick={() => runAction(onEdit)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-on-surface hover:bg-surface-container-low disabled:opacity-50"
              >
                <MaterialIcon name="edit" className="text-sm text-primary" />
                Sửa
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={disabled}
                onClick={() => runAction(onToggleQuick)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-on-surface hover:bg-surface-container-low disabled:opacity-50"
              >
                <MaterialIcon
                  name={category.showInQuickFilter ? 'filter_alt_off' : 'filter_alt'}
                  className="text-sm"
                />
                {category.showInQuickFilter ? 'Ẩn lọc nhanh' : 'Hiện lọc nhanh'}
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={disabled}
                onClick={() => runAction(onToggleActive)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-on-surface hover:bg-surface-container-low disabled:opacity-50"
              >
                <MaterialIcon
                  name={category.active ? 'visibility_off' : 'visibility'}
                  className="text-sm"
                />
                {category.active ? 'Ẩn danh mục' : 'Hiện danh mục'}
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={disabled}
                onClick={() => runAction(onDelete)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <MaterialIcon name="delete" className="text-sm" />
                Xóa
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

function CategoriesListMobile({
  categories = [],
  selectedIds = [],
  onToggleSelect,
  onEdit,
  onToggleQuick,
  onToggleActive,
  onDelete,
  busy = false,
}) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-outline-variant/40 px-3 py-8 text-center text-xs text-on-surface-variant">
        Chưa có danh mục
      </div>
    )
  }

  return (
    <div className="divide-y divide-outline-variant/20 overflow-visible rounded-xl border border-outline-variant/25 bg-surface-container-lowest">
      {categories.map((category) => {
        const checked = selectedIds.includes(category.id)
        return (
          <div
            key={category.id}
            className={['px-2.5 py-2', !category.active ? 'opacity-60' : ''].join(' ')}
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={checked}
                disabled={busy}
                onChange={() => onToggleSelect?.(category.id)}
                className="h-3.5 w-3.5 rounded border-outline-variant"
                aria-label={`Chọn ${category.name}`}
              />
              <button
                type="button"
                onClick={() => onEdit?.(category)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-container-low text-primary">
                  <MaterialIcon name="label" className="text-base" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {category.name}
                    {category.showInQuickFilter ? (
                      <span className="ml-1.5 text-[10px] font-medium text-primary">· Lọc nhanh</span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-on-surface-variant">
                    <span className="font-mono">{category.slug || '—'}</span>
                    {!category.active ? ' · Đã ẩn' : ''}
                  </p>
                </div>
              </button>
              <CategoryMoreMenu
                category={category}
                disabled={busy}
                onEdit={onEdit}
                onToggleQuick={onToggleQuick}
                onToggleActive={onToggleActive}
                onDelete={onDelete}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function CategoriesListMobileSkeleton({ rows = 8 }) {
  return (
    <div className="divide-y divide-outline-variant/20 overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-2 px-2.5 py-2.5">
          <div className="img-shimmer h-3.5 w-3.5 shrink-0 rounded" />
          <div className="img-shimmer h-9 w-9 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="img-shimmer h-4 w-32 max-w-[65%] rounded" />
            <div className="img-shimmer h-3 w-24 max-w-[50%] rounded" />
          </div>
          <div className="img-shimmer h-7 w-7 shrink-0 rounded-md" />
        </div>
      ))}
    </div>
  )
}

export default CategoriesListMobile
