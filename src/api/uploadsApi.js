import { apiRequest } from './client'

export function uploadImagesApi(files, { folder = 'products' } = {}) {
  const formData = new FormData()
  for (const file of files) {
    formData.append('images', file)
  }
  if (folder) {
    formData.append('folder', folder)
  }
  return apiRequest('/uploads/images', {
    method: 'POST',
    body: formData,
  })
}

export function deleteUploadedImageApi(publicId) {
  return apiRequest('/uploads/images', {
    method: 'DELETE',
    body: JSON.stringify({ publicId }),
  })
}
