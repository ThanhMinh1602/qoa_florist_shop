import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { overlayFade, sheetEnter } from '../../../lib/motion'
import { useScrollLock } from '../../../hooks/useScrollLock'
import AdminMobileFormActions from './AdminMobileFormActions'

const inputClass =
  'w-full rounded-xl border border-outline-variant/25 bg-white/50 px-3 py-2.5 text-sm outline-none backdrop-blur-sm focus:ring-2 focus:ring-primary/20'

const pageFieldClass =
  'w-full rounded-lg border border-outline-variant/25 px-3 py-2.5 text-[15px] text-on-surface outline-none transition placeholder:text-outline/55 focus:border-primary/40 focus:ring-2 focus:ring-primary/20'

const pageLabelClass = 'mb-1 block text-xs font-medium text-on-surface'
const sectionTitleClass =
  'text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase'

export const EMPTY_CATEGORY_FORM = {
  name: '',
  showInQuickFilter: true,
  active: true,
}

function CategoryFormDialog({
  open,
  title,
  values,
  onChange,
  onSubmit,
  onClose,
  onDelete,
  formError,
  isEditing,
  /** `dialog` = sheet (desktop). `page` = màn full (mobile). */
  mode = 'dialog',
}) {
  const isPage = mode === 'page'
  useScrollLock(!isPage && open)
  const nameRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => nameRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [open])

  if (isPage) {
    if (!open) return null
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <header className="flex shrink-0 items-center gap-2 border-b border-outline-variant/25 bg-surface-container-lowest px-3 py-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low"
            aria-label="Quay lại"
          >
            <MaterialIcon name="arrow_back" className="text-xl" />
          </button>
          <h2
            id="category-form-page-title"
            className="min-w-0 flex-1 truncate font-display text-base text-primary"
          >
            {title}
          </h2>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]">
          <form id="category-form-page" onSubmit={onSubmit} className="space-y-2.5 px-2.5 py-2.5 pb-4">
            <section className="overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest">
              <div className="border-b border-outline-variant/20 p-2.5">
                <h3 className={sectionTitleClass}>Thông tin</h3>
                <div className="mt-1.5">
                  <label className="block">
                    <span className={pageLabelClass}>
                      Tên danh mục <span className="text-primary">*</span>
                    </span>
                    <input
                      ref={nameRef}
                      required
                      value={values.name}
                      onChange={(e) => onChange('name', e.target.value)}
                      placeholder="Ví dụ: Hoa sáp"
                      className={pageFieldClass}
                    />
                  </label>
                </div>
              </div>

              <div className="p-2.5">
                <h3 className={sectionTitleClass}>Hiển thị</h3>
                <div className="mt-1.5 space-y-2.5">
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
              </div>
            </section>

            {formError ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
                {formError}
              </p>
            ) : null}
          </form>
        </div>

        <AdminMobileFormActions className="px-3 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-xl border border-red-200/80 bg-red-50/50 px-4 py-3 text-sm font-medium text-red-600 transition active:bg-red-50"
              >
                Xóa
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              form="category-form-page"
              className={[
                'rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(74,48,32,0.22)] transition active:bg-primary-container',
                onDelete ? '' : 'col-span-2',
              ].join(' ')}
            >
              Lưu
            </button>
          </div>
        </AdminMobileFormActions>
      </div>
    )
  }

  const formFields = (
    <>
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

      <div className="space-y-2.5 rounded-2xl border border-outline-variant/25 bg-surface-container-low/40 p-3">
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
    </>
  )

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
              className="max-h-[min(80dvh,80%)] space-y-4 overflow-y-auto overscroll-contain px-5 py-4"
            >
              {formFields}
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

export default CategoryFormDialog
