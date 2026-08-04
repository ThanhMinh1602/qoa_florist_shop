import { SWRConfig } from 'swr'

/** Cấu hình SWR dùng chung cho toàn app. */
export const swrDefaultConfig = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 2,
  dedupingInterval: 2000,
  keepPreviousData: true,
}

export function SwrProvider({ children }) {
  return <SWRConfig value={swrDefaultConfig}>{children}</SWRConfig>
}
