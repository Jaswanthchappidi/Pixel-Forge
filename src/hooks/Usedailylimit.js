import { useState, useCallback } from 'react'
import { getDailyUsage, incrementDailyUsage, isLimitReached, getDailyMax } from '../utils/Storage'

/**
 * Hook for tracking & enforcing per-day usage limits.
 *
 * Usage:
 *   const { usage, max, limited, consume } = useDailyLimit()
 *   if (!consume()) return  // blocked
 */
export function useDailyLimit() {
  const [usage, setUsage] = useState(() => getDailyUsage().count)
  const max = getDailyMax()

  const consume = useCallback(() => {
    if (isLimitReached()) return false
    const next = incrementDailyUsage()
    setUsage(next.count)
    return true
  }, [])

  return {
    usage,
    max,
    limited: usage >= max,
    remaining: Math.max(0, max - usage),
    consume,
  }
}