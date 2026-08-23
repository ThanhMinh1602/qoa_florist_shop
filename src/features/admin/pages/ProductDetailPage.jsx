import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import LoadingOverlay from '../../../components/common/LoadingOverlay'
import MaterialIcon from '../../../components/common/MaterialIcon'
import {
  createProductApi,
  deleteProductApi,
  updateProductApi,
} from '../../../api/productsApi'
import { createCategoryApi } from '../../../api/categoriesApi'
import { deleteUploadedImageApi } from '../../../api/uploadsApi'
import { useDialog } from '../../../context/DialogContext'
import { useAdminCategories, useProducts } from '../../../hooks/swr'
import { formatMoney } from '../../../utils/money'
import ProductFormDialog, {
  EMPTY_FORM,
  generateProductCode,
  prepareColorsPayload,
  prepareImagesPayload,
  revokeFormMedia,
  revokeLocalPreviews,
  toForm,
} from '../components/ProductFormDialog'

const FORM_ID = 'product-detail-form'

function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { alert, confirm } = useDialog()
  const { products, isLoading, mutate: mutateProducts } = useProducts()
  const { categories, mutate: mutateCategories } = useAdminCategories()

  const isCreate = !productId
  const product = useMemo(
    () => (isCreate ? null : products.find((item) => item.id === productId) || null),
    [isCreate, productId, products],
  )

  const editFromQuery = searchParams.get('edit') === '1'
  const [isEditing, setIsEditing] = useState(isCreate || editFromQuery)
  const [form, setForm] = useState(() =>
    isCreate ? { ...EMPTY_FORM, code: generateProductCode() } : EMPTY_FORM,
  )
  const [formReady, setFormReady] = useState(isCreate)
  const [formError, setFormError] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [busyMessage, setBusyMessage] = useState('Đang xử lý...')
  const removedPublicIdsRef = useRef([])
  const initializedIdRef = useRef(isCreate ? 'new' : null)
  const formImagesRef = useRef(form.images)
  formImagesRef.current = form.images

  useEffect(() => {
    if (isCreate) {
      setIsEditing(true)
      return
    }
    if (editFromQuery) setIsEditing(true)
  }, [editFromQuery, isCreate, productId])

  useEffect(() => {
    if (isCreate) {
      if (initializedIdRef.current !== 'new') {
        revokeFormMedia({ images: formImagesRef.current, colors: form?.colors })
        removedPublicIdsRef.current = []
        setForm({ ...EMPTY_FORM, code: generateProductCode() })
        setFormError('')
        setFormReady(true)
        initializedIdRef.current = 'new'
      }
      return
    }

    if (!product) return
    if (initializedIdRef.current === product.id) return

    revokeFormMedia({ images: formImagesRef.current, colors: form?.colors })
    removedPublicIdsRef.current = []
    setForm(toForm(product))
    setFormError('')
    setFormReady(true)
    initializedIdRef.current = product.id
  }, [isCreate, product])

  useEffect(() => {
    return () => {
      revokeFormMedia({ images: formImagesRef.current, colors: form?.colors })
    }
  }, [])


  function clearEditQuery() {
    if (!searchParams.has('edit')) return
    const next = new URLSearchParams(searchParams)
    next.delete('edit')
    setSearchParams(next, { replace: true })
  }

  function enterEdit() {
    if (product) setForm(toForm(product))
    setFormError('')
    removedPublicIdsRef.current = []
    setIsEditing(true)
    const next = new URLSearchParams(searchParams)
    next.set('edit', '1')
    setSearchParams(next, { replace: true })
  }

  function exitEdit() {
    setIsEditing(false)
    clearEditQuery()
  }

  function handleCancel() {
    if (isCreate) {
      revokeFormMedia(form)
      navigate('/admin/products')
      return
    }
    revokeFormMedia(form)
    removedPublicIdsRef.current = []
    if (product) setForm(toForm(product))
    setFormError('')
    exitEdit()
  }

  function handleChange(field, value) {
    setFormError('')
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  function queueRemovedCloudImage(publicId) {
    if (!publicId) return
    if (!removedPublicIdsRef.current.includes(publicId)) {
      removedPublicIdsRef.current.push(publicId)
    }
  }

  function regenerateCode() {
    setForm((previous) => ({ ...previous, code: generateProductCode() }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isBusy) return

    const snapshot = {
      ...form,
      images: [...(form.images || [])],
      colors: (form.colors || []).map((color) => ({
        ...color,
        images: [...(color.images || [])],
      })),
    }
    const toDelete = [...removedPublicIdsRef.current]

    setFormError('')
    setBusyMessage(isCreate ? 'Đang thêm sản phẩm...' : 'Đang cập nhật sản phẩm...')
    setIsBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 80))

    try {
      const colors = await prepareColorsPayload(snapshot.colors, prepareImagesPayload)
      const images = colors.length
        ? colors.flatMap((color, colorIndex) =>
            (color.images || []).map((image, imageIndex) => ({
              ...image,
              isMain: colorIndex === 0 && imageIndex === 0,
            })),
          )
        : await prepareImagesPayload(snapshot.images)
      const payload = {
        ...snapshot,
        colors,
        images,
        categoryIds: Array.isArray(snapshot.categoryIds) ? snapshot.categoryIds : [],
        costPrice: Number(snapshot.costPrice) || 0,
        makeMinutes: Number(snapshot.makeMinutes) || 0,
        listPrice: Number(snapshot.listPrice) || 0,
        sellPrice: Number(snapshot.sellPrice) || 0,
        otherCost: Number(snapshot.otherCost) || 0,
        soldCount: Math.max(0, Math.floor(Number(snapshot.soldCount) || 0)),
      }

      let savedId = productId
      if (isCreate) {
        const result = await createProductApi(payload)
        savedId = result?.data?.id
      } else {
        await updateProductApi(productId, payload)
      }

      await Promise.all(
        toDelete.map((publicId) => deleteUploadedImageApi(publicId).catch(() => null)),
      )
      await mutateProducts()

      removedPublicIdsRef.current = []
      revokeFormMedia(snapshot)
      setIsBusy(false)

      await alert({
        title: isCreate ? 'Thêm sản phẩm thành công' : 'Đã cập nhật',
        message: isCreate
          ? 'Sản phẩm mới đã được thêm vào danh sách.'
          : 'Thông tin sản phẩm đã được cập nhật.',
        variant: 'success',
      })

      if (isCreate && savedId) {
        initializedIdRef.current = null
        navigate(`/admin/products/${savedId}`, { replace: true })
      } else if (isCreate) {
        navigate('/admin/products')
      } else {
        initializedIdRef.current = null
        exitEdit()
      }
    } catch (err) {
      setIsBusy(false)
      setFormError(err.message || 'Không thể lưu sản phẩm.')
      await alert({
        title: isCreate ? 'Không thể thêm sản phẩm' : 'Không thể cập nhật',
        message: err.message || 'Không thể lưu sản phẩm.',
        variant: 'error',
      })
    }
  }

  async function handleDelete() {
    if (isBusy || isCreate || !product) return
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
      await mutateProducts()
      revokeFormMedia(form)
      removedPublicIdsRef.current = []
      setIsBusy(false)
      await alert({
        title: 'Đã xóa',
        message: `“${product.name}” đã được xóa mềm.`,
        variant: 'success',
      })
      navigate('/admin/products')
    } catch (err) {
      setIsBusy(false)
      await alert({
        title: 'Không thể xóa',
        message: err.message || 'Không thể xóa sản phẩm.',
        variant: 'error',
      })
    }
  }

  const showForm = isCreate || isEditing
  const headerTitle = isCreate
    ? 'Thêm sản phẩm'
    : product?.name || (isLoading ? 'Đang tải…' : 'Chi tiết sản phẩm')

  const deleteButton =
    !isCreate && product ? (
      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={isBusy}
        className="inline-flex items-center gap-1 rounded-xl border border-red-200/80 bg-red-50/40 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 sm:text-sm disabled:opacity-60"
        title="Xóa sản phẩm"
      >
        <MaterialIcon name="delete" className="text-base" />
        Xóa
      </button>
    ) : null

  const primaryActions = showForm ? (
    <div key="edit-actions" className="flex items-center gap-2">
      <button
        type="button"
        onClick={(event) => void handleSubmit(event)}
        disabled={isBusy || !formReady}
        className="btn-primary !px-3 !py-2 text-xs sm:text-sm disabled:opacity-60"
      >
        {isBusy ? 'Đang lưu...' : 'Lưu'}
      </button>
      <button
        type="button"
        onClick={handleCancel}
        disabled={isBusy}
        className="btn-glass !px-3 !py-2 text-xs sm:text-sm disabled:opacity-60"
      >
        Hủy
      </button>
    </div>
  ) : (
    <button
      key="view-edit"
      type="button"
      onClick={enterEdit}
      disabled={!product}
      className="btn-primary inline-flex items-center gap-1 !px-3 !py-2 text-xs sm:text-sm disabled:opacity-60"
    >
      <MaterialIcon name="edit" className="text-base" />
      Sửa
    </button>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col p-2 pb-[calc(var(--admin-bottom-nav-offset)+1rem)] sm:p-3 lg:p-4 lg:pb-4">
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-outline-variant/15 bg-white shadow-[0_8px_30px_rgba(74,48,32,0.06)]">
          <header className="shrink-0 border-b border-outline-variant/15 px-4 py-3 sm:px-5 sm:py-3.5 lg:px-6 lg:py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  to="/admin/products"
                  className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-on-surface-variant transition hover:text-primary"
                >
                  <MaterialIcon name="arrow_back" className="text-base" />
                  Sản phẩm
                </Link>

                {!isCreate && isLoading && !product ? (
                  <p className="text-sm text-on-surface-variant">Đang tải sản phẩm…</p>
                ) : !isCreate && !isLoading && !product ? (
                  <div>
                    <p className="text-sm text-red-600">Không tìm thấy sản phẩm.</p>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/products')}
                      className="mt-2 text-sm font-semibold text-primary"
                    >
                      Về danh sách
                    </button>
                  </div>
                ) : (
                  <>
                    {!isCreate && product?.code ? (
                      <p className="font-mono text-[11px] font-bold tracking-[0.12em] text-on-surface-variant">
                        {product.code}
                      </p>
                    ) : null}
                    <h2 className="mt-0.5 truncate font-display text-lg leading-tight text-primary sm:text-xl lg:text-2xl">
                      {headerTitle}
                    </h2>
                    {!isCreate && product && !showForm ? (
                      <p className="mt-1 text-sm tabular-nums text-on-surface-variant">
                        {formatMoney(product.sellPrice)}
                        <span className="mx-1.5 text-outline-variant">·</span>
                        {product.active !== false ? 'Đang bán' : 'Đã ẩn'}
                      </p>
                    ) : null}
                    {showForm ? (
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {isCreate ? 'Nhập thông tin rồi bấm Lưu.' : 'Đang chỉnh sửa — bấm Lưu để áp dụng.'}
                      </p>
                    ) : null}
                  </>
                )}
              </div>

              {isCreate || product ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {deleteButton}
                  {primaryActions}
                </div>
              ) : null}
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 lg:p-6">
            {formReady && (isCreate || product) ? (
              <ProductFormDialog
                mode="embedded"
                open
                readOnly={!showForm}
                formId={FORM_ID}
                values={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onClose={handleCancel}
                onRegenerateCode={regenerateCode}
                onRemoveCloudImage={queueRemovedCloudImage}
                onQuickCreateCategory={async (name) => {
                  const result = await createCategoryApi({
                    name,
                    showInQuickFilter: true,
                    active: true,
                  })
                  await mutateCategories()
                  return result.data
                }}
                categoryOptions={categories}
                isEditing={!isCreate}
                formError={formError}
                title={headerTitle}
              />
            ) : null}
          </div>
        </section>
      </div>
      <LoadingOverlay open={isBusy} message={busyMessage} />
    </div>
  )
}

export default ProductDetailPage
