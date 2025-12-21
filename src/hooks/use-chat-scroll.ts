'use client'

import { useEffect, useRef } from 'react'

export function useChatScroll<T>(
  dep: T,
  options: {
    behavior?: ScrollBehavior
    threshold?: number
    enabled?: boolean
  } = {}
) {
  const { behavior = 'smooth', threshold = 100, enabled = true } = options
  const ref = useRef<HTMLDivElement>(null)
  const lastScrollTop = useRef(0)

  useEffect(() => {
    if (!enabled || !ref.current) return

    const element = ref.current
    const shouldAutoScroll = 
      element.scrollTop + element.clientHeight >= 
      element.scrollHeight - threshold

    // Only auto-scroll if user is near the bottom
    if (shouldAutoScroll) {
      element.scrollTo({
        top: element.scrollHeight,
        behavior
      })
    }

    lastScrollTop.current = element.scrollTop
  }, [dep, behavior, threshold, enabled])

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (ref.current) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior
      })
    }
  }

  return { ref, scrollToBottom }
}
