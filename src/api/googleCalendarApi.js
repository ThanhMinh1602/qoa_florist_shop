import { apiRequest } from './client'

export function fetchGoogleCalendarStatusApi() {
  return apiRequest('/google-calendar/status')
}

export function fetchGoogleCalendarConnectUrlApi() {
  return apiRequest('/google-calendar/connect')
}

export function disconnectGoogleCalendarApi() {
  return apiRequest('/google-calendar/disconnect', { method: 'POST' })
}

export function updateGoogleCalendarSettingsApi(payload) {
  return apiRequest('/google-calendar/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function syncGoogleCalendarSharesApi() {
  return apiRequest('/google-calendar/sync-shares', { method: 'POST' })
}

export function syncGoogleCalendarOrdersApi(payload = {}) {
  return apiRequest('/google-calendar/sync-orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

