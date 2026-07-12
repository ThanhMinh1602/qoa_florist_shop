import { apiRequest } from './client'

export function fetchStatsOverviewApi() {
  return apiRequest('/stats/overview')
}
