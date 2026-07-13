import { apiRequest } from './client'

export function uploadImagesApi(files) {
  const formData = new FormData()
  for (const file of files) {
    formData.append('images', file)
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
