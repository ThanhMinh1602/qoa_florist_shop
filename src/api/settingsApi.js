import { apiRequest } from './client'

export function fetchLandingSettingsApi() {
  return apiRequest('/settings/landing')
}

export function updateLandingSettingsApi(payload) {
  return apiRequest('/settings/landing', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
