import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSWRConfig } from 'swr'
import LoadingOverlay from '../../../components/common/LoadingOverlay'
import {
  createCategoryApi,
  deleteCategoryApi,
  updateCategoryApi,
} from '../../../api/categoriesApi'
import { useDialog } from '../../../context/DialogContext'
import { useAdminCategories } from '../../../hooks/swr'
import { swrKeys } from '../../../hooks/swr/keys'
import AdminMobileOverlayShell from '../components/AdminMobileOverlayShell'
import CategoryFormDialog, { EMPTY_CATEGORY_FORM } from '../components/CategoryFormDialog'

function toForm(category) {
  return {
    name: category?.name || '',
    showInQuickFilter: category?.showInQuickFilter !== false,
    active: category?.active !== false,
  }
}

function CategoryEditPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const { alert, confirm } = useDialog()
  const { mutate: globalMutate } = useSWRConfig()
  const {
    categories,
    isLoading,
    mutate: mutateCategories,
  } = useAdminCategories()

  const isCreate = !categoryId
  const category = useMemo(
    () => (isCreate ? null : categories.find((item) => item.id === categoryId) || null),
    [isCreate, categoryId, categories],
  )

  const [form, setForm] = useState(() =>
    isCreate ? { ...EMPTY_CATEGORY_FORM } : EMPTY_CATEGORY_FORM,
  )
  const [formReady, setFormReady] = useState(isCreate)
  const [formError, setFormError] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [busyMessage, setBusyMessage] = useState('Đang xử lý...')
  const initializedIdRef = useRef(isCreate ? 'new' : null)

  useEffect(() => {
    if (isCreate) {
      if (initializedIdRef.current !== 'new') {
        setForm({ ...EMPTY_CATEGORY_FORM })
        setFormError('')
        setFormReady(true)
        initializedIdRef.current = 'new'
      }
      return
    }

    if (!category) return
    if (initializedIdRef.current === category.id) return

    setForm(toForm(category))
    setFormError('')
    setFormReady(true)
    initializedIdRef.current = category.id
  }, [isCreate, category])

  function handleChange(field, value) {
    setFormError('')
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  async function reloadLists() {
    await Promise.all([
      mutateCategories(),
      globalMutate(swrKeys.publicCategories),
      globalMutate(swrKeys.products('all')),
    ])
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isBusy) return

    const trimmed = form.name.trim()
    if (!trimmed) {
      setFormError('Vui lòng nhập tên danh mục.')
      return
    }

    const payload = {
      name: trimmed,
      showInQuickFilter: form.showInQuickFilter !== false,
      active: form.active !== false,
    }

    setFormError('')
    setBusyMessage(isCreate ? 'Đang thêm danh mục...' : 'Đang cập nhật danh mục...')
    setIsBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 80))

    try {
      if (isCreate) {
        await createCategoryApi({
          ...payload,
          sortOrder: (categories?.length || 0) + 1,
        })
      } else {
        await updateCategoryApi(categoryId, payload)
      }
      await reloadLists()
      setIsBusy(false)
      await alert({
        title: isCreate ? 'Đã thêm danh mục' : 'Đã cập nhật',
        message: isCreate
          ? 'Danh mục mới đã được thêm.'
          : 'Thông tin danh mục đã được lưu.',
        variant: 'success',
      })
      navigate('/admin/categories')
    } catch (err) {
      setIsBusy(false)
      setFormError(err.message || 'Không thể lưu danh mục.')
      await alert({
        title: isCreate ? 'Không thể thêm danh mục' : 'Không thể cập nhật',
        message: err.message || 'Thử lại sau.',
        variant: 'error',
      })
    }
  }

  async function handleDelete() {
    if (isBusy || isCreate || !category) return
    const ok = await confirm({
      title: 'Xóa danh mục',
      message: `Xóa “${category.name}”? Sản phẩm gắn danh mục này sẽ bỏ liên kết.`,
      confirmLabel: 'Xóa',
      variant: 'danger',
    })
    if (!ok) return

    setBusyMessage('Đang xóa danh mục...')
    setIsBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 80))
    try {
      await deleteCategoryApi(category.id)
      await reloadLists()
      setIsBusy(false)
      await alert({
        title: 'Đã xóa',
        message: `“${category.name}” đã được xóa.`,
        variant: 'success',
      })
      navigate('/admin/categories')
    } catch (err) {
      setIsBusy(false)
      await alert({
        title: 'Không thể xóa',
        message: err.message || 'Thử lại sau.',
        variant: 'error',
      })
    }
  }

  return (
    <>
      <AdminMobileOverlayShell backTo="/admin/categories" zIndexClass="z-[90]">
        {({ requestClose }) => {
          if (!isCreate && isLoading && !category) {
            return (
              <p className="flex flex-1 items-center justify-center p-6 text-sm text-on-surface-variant">
                Đang tải...
              </p>
            )
          }

          if (!isCreate && !isLoading && !category) {
            return (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
                <p className="text-sm text-on-surface-variant">Không tìm thấy danh mục.</p>
                <button type="button" className="btn-primary" onClick={requestClose}>
                  Quay lại danh sách
                </button>
              </div>
            )
          }

          if (!formReady) {
            return (
              <p className="flex flex-1 items-center justify-center p-6 text-sm text-on-surface-variant">
                Đang tải...
              </p>
            )
          }

          return (
            <CategoryFormDialog
              mode="page"
              open
              values={form}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onClose={requestClose}
              onDelete={isCreate ? undefined : handleDelete}
              formError={formError}
              isEditing={!isCreate}
              title={isCreate ? 'Thêm danh mục' : 'Sửa danh mục'}
            />
          )
        }}
      </AdminMobileOverlayShell>
      <LoadingOverlay open={isBusy} message={busyMessage} />
    </>
  )
}

export default CategoryEditPage
