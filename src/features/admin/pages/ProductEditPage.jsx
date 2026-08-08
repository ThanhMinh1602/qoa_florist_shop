import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import LoadingOverlay from '../../../components/common/LoadingOverlay'
import {
  createProductApi,
  deleteProductApi,
  updateProductApi,
} from '../../../api/productsApi'
import { createCategoryApi } from '../../../api/categoriesApi'
import { deleteUploadedImageApi } from '../../../api/uploadsApi'
import { useDialog } from '../../../context/DialogContext'
import { useAdminCategories, useProducts } from '../../../hooks/swr'
import { useScrollLock } from '../../../hooks/useScrollLock'
import { adminMobileSlideTransition, easeOut } from '../../../lib/motion'
import ProductFormDialog, {
  EMPTY_FORM,
  generateProductCode,
  prepareImagesPayload,
  revokeLocalPreviews,
  toForm,
} from '../components/ProductFormDialog'

function ProductEditPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { alert, confirm } = useDialog()
  const { products, isLoading, mutate: mutateProducts } = useProducts()
  const { categories, mutate: mutateCategories } = useAdminCategories()

  const isCreate = !productId
  const product = useMemo(
    () => (isCreate ? null : products.find((item) => item.id === productId) || null),
    [isCreate, productId, products],
  )

  const [form, setForm] = useState(() =>
    isCreate ? { ...EMPTY_FORM, images: [], code: generateProductCode() } : EMPTY_FORM,
  )
  const [formReady, setFormReady] = useState(isCreate)
  const [formError, setFormError] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [busyMessage, setBusyMessage] = useState('Đang xử lý...')
  const [leaving, setLeaving] = useState(false)
  const removedPublicIdsRef = useRef([])
  const initializedIdRef = useRef(isCreate ? 'new' : null)

  // Cover full viewport — không đụng header/nav layout (tránh giật khi back)
  useScrollLock(true)

  useEffect(() => {
    if (isCreate) {
      if (initializedIdRef.current !== 'new') {
        revokeLocalPreviews(form.images)
        removedPublicIdsRef.current = []
        setForm({ ...EMPTY_FORM, images: [], code: generateProductCode() })
        setFormError('')
        setFormReady(true)
        initializedIdRef.current = 'new'
      }
      return
    }

    if (!product) return
    if (initializedIdRef.current === product.id) return

    revokeLocalPreviews(form.images)
    removedPublicIdsRef.current = []
    setForm(toForm(product))
    setFormError('')
    setFormReady(true)
    initializedIdRef.current = product.id
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ hydrate khi đổi product
  }, [isCreate, product])

  const finishLeave = useCallback(() => {
    revokeLocalPreviews(form.images)
    removedPublicIdsRef.current = []
    navigate('/admin/products')
  }, [form.images, navigate])

  const goBack = useCallback(() => {
    if (leaving || isBusy) return
    setLeaving(true)
  }, [isBusy, leaving])

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
    if (isBusy || leaving) return

    const snapshot = {
      ...form,
      images: [...(form.images || [])],
    }
    const toDelete = [...removedPublicIdsRef.current]

    setFormError('')
    setBusyMessage(isCreate ? 'Đang thêm sản phẩm...' : 'Đang cập nhật sản phẩm...')
    setIsBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 80))

    try {
      const images = await prepareImagesPayload(snapshot.images)
      const payload = {
        ...snapshot,
        images,
        categoryIds: Array.isArray(snapshot.categoryIds) ? snapshot.categoryIds : [],
        costPrice: Number(snapshot.costPrice) || 0,
        makeMinutes: Number(snapshot.makeMinutes) || 0,
        listPrice: Number(snapshot.listPrice) || 0,
        sellPrice: Number(snapshot.sellPrice) || 0,
        otherCost: Number(snapshot.otherCost) || 0,
        soldCount: Math.max(0, Math.floor(Number(snapshot.soldCount) || 0)),
      }

      if (isCreate) {
        await createProductApi(payload)
      } else {
        await updateProductApi(productId, payload)
      }

      await Promise.all(
        toDelete.map((publicId) => deleteUploadedImageApi(publicId).catch(() => null)),
      )
      await mutateProducts()

      removedPublicIdsRef.current = []
      revokeLocalPreviews(snapshot.images)
      setIsBusy(false)

      await alert({
        title: isCreate ? 'Thêm sản phẩm thành công' : 'Đã cập nhật',
        message: isCreate
          ? 'Sản phẩm mới đã được thêm vào danh sách.'
          : 'Thông tin sản phẩm đã được cập nhật.',
        variant: 'success',
      })
      navigate('/admin/products')
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
    if (isBusy || isCreate || !product || leaving) return
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
      revokeLocalPreviews(form.images)
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

  const shell = (child) => {
    if (typeof document === 'undefined') return null
    return createPortal(
      <motion.div
        className="fixed inset-0 z-[80] flex flex-col bg-background"
        initial={{ x: '100%' }}
        animate={{ x: leaving ? '100%' : 0 }}
        transition={
          leaving
            ? { duration: 0.26, ease: easeOut }
            : adminMobileSlideTransition
        }
        onAnimationComplete={() => {
          if (leaving) finishLeave()
        }}
      >
        {child}
        <LoadingOverlay open={isBusy} message={busyMessage} />
      </motion.div>,
      document.body,
    )
  }

  if (!isCreate && isLoading && !product) {
    return shell(
      <p className="flex flex-1 items-center justify-center p-6 text-sm text-on-surface-variant">
        Đang tải...
      </p>,
    )
  }

  if (!isCreate && !isLoading && !product) {
    return shell(
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-on-surface-variant">Không tìm thấy sản phẩm.</p>
        <button type="button" className="btn-primary" onClick={goBack}>
          Quay lại danh sách
        </button>
      </div>,
    )
  }

  if (!formReady) {
    return shell(
      <p className="flex flex-1 items-center justify-center p-6 text-sm text-on-surface-variant">
        Đang tải...
      </p>,
    )
  }

  return shell(
    <ProductFormDialog
      mode="page"
      open
      values={form}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onClose={goBack}
      onDelete={isCreate ? undefined : handleDelete}
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
      title={isCreate ? 'Thêm sản phẩm' : 'Sửa sản phẩm'}
    />,
  )
}

export default ProductEditPage
