import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { configService } from '../services/configService.jsx'

export function useConfig() {
  const { data: config, isLoading, error } = useQuery(
    'config',
    () => configService.getConfig(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    }
  )

  return {
    config: config || configService.getCachedConfig(),
    isLoading,
    error
  }
}

export function useFeature(feature) {
  const { config } = useConfig()
  return configService.getFeature(feature)
}

export function useContent(key) {
  const { config } = useConfig()
  return configService.getContent(key)
}

export function useTheme() {
  const { config } = useConfig()
  return config?.ui?.theme || {}
}

export function useSpacing() {
  const { config } = useConfig()
  return config?.ui?.spacing || {}
}