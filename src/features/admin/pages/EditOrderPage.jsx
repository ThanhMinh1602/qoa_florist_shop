import { Navigate, useParams } from 'react-router-dom'

/** Legacy `/admin/orders/:orderId/edit` → detail page in edit mode. */
function EditOrderPage() {
  const { orderId } = useParams()
  return <Navigate to={`/admin/orders/${orderId}?edit=1`} replace />
}

export default EditOrderPage
