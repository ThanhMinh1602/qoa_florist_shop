import { useCallback, useEffect, useMemo, useState } from 'react'
import MaterialIcon from '../../../components/common/MaterialIcon'
import {
  activateProductApi,
  createProductApi,
  deactivateProductApi,
  deleteProductApi,
  fetchProductsApi,
  updateProductApi,
} from '../../../api/productsApi'
import { useDialog } from '../../../context/DialogContext'
import { formatMoney } from '../../../utils/money'
import { useIsLgUp } from '../../../hooks/useMediaQuery'

const EMPTY_FORM = {
  code: '',
  name: '',
  materials: '',
  costPrice: '',
  makeMinutes: '',
  listPrice: '',
  sellPrice: '',
  otherCost: '',
  active: true,
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

/** Mã SP: 8 chữ cái in hoa */
function generateProductCode(length = 8) {
  const chars = CODE_CHARS
  let code = ''
  const values = crypto.getRandomValues(new Uint8Array(length))
  for (let i = 0; i < length; i += 1) {
    code += chars[values[i] % chars.length]
  }
  return code
}

const inputClass =
  'w-full rounded-xl border border-rose-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-100'

function toForm(product) {
  return {
    code: product.code || '',
    name: product.name || '',
    materials: product.materials || '',
    costPrice: product.costPrice ?? '',
    makeMinutes: product.makeMinutes ?? '',
    listPrice: product.listPrice ?? '',
    sellPrice: product.sellPrice ?? '',
    otherCost: product.otherCost ?? '',
    active: product.active !== false,
  }
}

function ProductFormDialog({
  open,
  values,
  onChange,
  onSubmit,
  onClose,
  onDelete,
  onRegenerateCode,
  isEditing,
  isSaving,
  formError,
  title,
}) {
  if (!open) return null

  const suggested = Math.round((Number(values.costPrice) || 0) * 1.7)
  const profit =
    (Number(values.sellPrice) || 0) -
    (Number(values.costPrice) || 0) -
    (Number(values.otherCost) || 0)

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Đóng"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        className="relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-rose-50 px-4 py-4 sm:px-6">
          <div>
            <h3 id="product-form-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">Thông tin lưu vào database.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Đóng"
          >
            <MaterialIcon name="close" className="text-xl" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Mã SP</span>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={values.code}
                    className={`${inputClass} font-mono font-bold tracking-wider text-slate-800 bg-slate-50`}
                  />
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={onRegenerateCode}
                      className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-rose-200 px-3 text-sm font-medium text-rose-700 hover:bg-rose-50"
                      title="Tạo mã mới"
                    >
                      <MaterialIcon name="refresh" className="text-lg" />
                    </button>
                  ) : null}
                </div>
                <span className="mt-1 block text-xs text-slate-400">
                  {isEditing
                    ? 'Mã đã tạo — không đổi khi sửa.'
                    : 'Tự sinh 8 chữ in hoa.'}
                </span>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Tên sản phẩm</span>
                <input
                  required
                  value={values.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Nguyên liệu</span>
              <textarea
                rows={2}
                value={values.materials}
                onChange={(e) => onChange('materials', e.target.value)}
                className={inputClass}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['costPrice', 'Giá cost'],
                ['makeMinutes', 'Thời gian làm (phút)'],
                ['listPrice', 'Giá bán (lãi 70%)'],
                ['sellPrice', 'Giá chốt'],
                ['otherCost', 'Chi phí khác'],
              ].map(([field, label]) => (
                <label key={field} className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">{label}</span>
                  <input
                    type="number"
                    min="0"
                    value={values[field]}
                    onChange={(e) => {
                      const next = e.target.value
                      if (field === 'costPrice') {
                        onChange('costPrice', next)
                        if (!values.listPrice) {
                          onChange(
                            'listPrice',
                            String(Math.round((Number(next) || 0) * 1.7)),
                          )
                        }
                      } else {
                        onChange(field, next)
                      }
                    }}
                    className={inputClass}
                  />
                </label>
              ))}
            </div>

            <p className="rounded-xl bg-rose-50/60 px-3 py-2 text-sm text-slate-600">
              Gợi ý giá bán ≈ cost × 1.7:{' '}
              <span className="font-medium text-slate-800">{formatMoney(suggested)}</span>
              {' · '}
              Lợi nhuận:{' '}
              <span className="font-semibold text-emerald-700">{formatMoney(profit)}</span>
            </p>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={values.active}
                onChange={(e) => onChange('active', e.target.checked)}
              />
              Đang bán
            </label>

            {formError ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                {formError}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 border-t border-rose-50 px-4 py-4 sm:px-6">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu vào database'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-rose-100 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 sm:ml-auto"
              >
                Xóa khỏi DB
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  )
}

function ProductsPage() {
  const { alert, confirm } = useDialog()
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [search, setSearch] = useState('')
  const isLgUp = useIsLgUp()

  const load = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const result = await fetchProductsApi()
      setProducts(result.data || [])
    } catch (err) {
      setError(err.message || 'Không thể tải sản phẩm.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return products
    return products.filter((item) =>
      [item.code, item.name, item.materials].join(' ').toLowerCase().includes(keyword),
    )
  }, [products, search])

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
    setEditingId(null)
    setForm({ ...EMPTY_FORM, code: generateProductCode() })
    setFormError('')
    setShowForm(true)
  }

  function openEdit(product) {
    setEditingId(product.id)
    setForm(toForm(product))
    setFormError('')
    setShowForm(true)
  }

  function regenerateCode() {
    setForm((previous) => ({ ...previous, code: generateProductCode() }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setFormError('')
    const wasEdit = Boolean(editingId)
    try {
      const payload = {
        ...form,
        costPrice: Number(form.costPrice) || 0,
        makeMinutes: Number(form.makeMinutes) || 0,
        listPrice: Number(form.listPrice) || 0,
        sellPrice: Number(form.sellPrice) || 0,
        otherCost: Number(form.otherCost) || 0,
      }
      if (editingId) {
        await updateProductApi(editingId, payload)
      } else {
        await createProductApi(payload)
      }
      closeForm()
      await load()
      await alert({
        title: wasEdit ? 'Đã cập nhật' : 'Đã thêm sản phẩm',
        message: wasEdit
          ? 'Thông tin sản phẩm đã được lưu vào database.'
          : 'Sản phẩm mới đã được thêm vào database.',
        variant: 'success',
      })
    } catch (err) {
      setFormError(err.message || 'Không thể lưu sản phẩm.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeactivate(product) {
    const ok = await confirm({
      title: 'Ngừng bán sản phẩm',
      message: `Ngừng bán “${product.name}”? Sản phẩm vẫn còn trong database.`,
      confirmLabel: 'Ngừng bán',
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
    const ok = await confirm({
      title: 'Xóa sản phẩm',
      message: `Xóa hẳn “${product.name}” khỏi database?\nThao tác này không hoàn tác được.`,
      confirmLabel: 'Xóa khỏi DB',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await deleteProductApi(product.id)
      if (editingId === product.id) closeForm()
      await load()
      await alert({
        title: 'Đã xóa',
        message: `“${product.name}” đã được xóa khỏi database.`,
        variant: 'success',
      })
    } catch (err) {
      await alert({
        title: 'Không thể xóa',
        message: err.message || 'Không thể xóa.',
        variant: 'error',
      })
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-rose-100 bg-white/80 px-4 py-4 backdrop-blur md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Sản phẩm</h2>
            <p className="mt-1 text-sm text-slate-500">
              Thêm / sửa / xóa bằng dialog — lưu trên MongoDB.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            <MaterialIcon name="add" className="text-lg" />
            Thêm sản phẩm
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm mã, tên, nguyên liệu..."
          className="w-full max-w-md rounded-xl border border-rose-100 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-100"
        />

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <p className="py-12 text-center text-sm text-slate-500">Đang tải...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-6 py-16 text-center">
            <MaterialIcon name="inventory_2" className="text-4xl text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">Chưa có sản phẩm</p>
          </div>
        ) : isLgUp ? (
          <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-rose-100 bg-rose-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Mã</th>
                    <th className="px-4 py-3">Tên / NL</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3">Giá chốt</th>
                    <th className="px-4 py-3">LN</th>
                    <th className="px-4 py-3">TG</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {filtered.map((product) => (
                    <tr key={product.id} className={!product.active ? 'opacity-50' : ''}>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold">
                        {product.code}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{product.name}</p>
                        <p className="max-w-xs truncate text-xs text-slate-500">{product.materials}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">{formatMoney(product.costPrice)}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium">
                        {formatMoney(product.sellPrice)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-emerald-700">
                        {formatMoney(product.profit)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {product.makeMinutes ? `${product.makeMinutes}'` : '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="mr-2 text-sm font-medium text-rose-600 hover:text-rose-700"
                        >
                          Sửa
                        </button>
                        {product.active ? (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(product)}
                            className="mr-2 text-sm text-slate-400 hover:text-slate-600"
                          >
                            Ngừng
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleActivate(product)}
                            className="mr-2 text-sm text-emerald-600 hover:text-emerald-700"
                          >
                            Bán lại
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          className="text-sm text-red-500 hover:text-red-600"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((product) => (
              <div
                key={product.id}
                className={[
                  'rounded-2xl border border-rose-100 bg-white p-4 shadow-sm',
                  !product.active ? 'opacity-60' : '',
                ].join(' ')}
              >
                <button type="button" onClick={() => openEdit(product)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-[11px] font-bold text-slate-500">{product.code}</p>
                      <p className="mt-1 font-semibold text-slate-900">{product.name}</p>
                    </div>
                    <p className="font-semibold text-rose-700">{formatMoney(product.sellPrice)}</p>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Cost {formatMoney(product.costPrice)} · LN {formatMoney(product.profit)}
                    {!product.active ? ' · Đã ngừng bán' : ''}
                  </p>
                </button>
                <div className="mt-3 flex gap-3 border-t border-rose-50 pt-3">
                  <button
                    type="button"
                    onClick={() => openEdit(product)}
                    className="text-sm font-medium text-rose-600"
                  >
                    Sửa
                  </button>
                  {product.active ? (
                    <button
                      type="button"
                      onClick={() => handleDeactivate(product)}
                      className="text-sm text-slate-500"
                    >
                      Ngừng
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleActivate(product)}
                      className="text-sm text-emerald-600"
                    >
                      Bán lại
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(product)}
                    className="text-sm text-red-500"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductFormDialog
        open={showForm}
        values={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={closeForm}
        onRegenerateCode={regenerateCode}
        isEditing={Boolean(editingId)}
        onDelete={
          editingId
            ? () => {
                const product = products.find((item) => item.id === editingId)
                if (product) handleDelete(product)
              }
            : undefined
        }
        isSaving={isSaving}
        formError={formError}
        title={editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
      />
    </div>
  )
}

export default ProductsPage
