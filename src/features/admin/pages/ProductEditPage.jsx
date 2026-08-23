import { Navigate, useParams } from 'react-router-dom'

/** Legacy `/admin/products/:productId/edit` → detail page in edit mode. */
function ProductEditPage() {
  const { productId } = useParams()
  if (!productId) {
    return <Navigate to="/admin/products/new" replace />
  }
  return <Navigate to={`/admin/products/${productId}?edit=1`} replace />
}

export default ProductEditPage
