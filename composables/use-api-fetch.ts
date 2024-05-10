import type { $Fetch } from 'ofetch'

export function useApiFetch(): $Fetch {
  const { $apiFetch } = useNuxtApp()

  return $apiFetch
}
