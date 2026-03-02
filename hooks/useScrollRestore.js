'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Hook to save and restore scroll position per route.
 * Uses sessionStorage keyed by pathname so back-navigation restores position.
 * 
 * @param {boolean} isReady - pass `true` once content has loaded (e.g. !loading)
 */
export function useScrollRestore(isReady = true) {
    const pathname = usePathname()
    const storageKey = `scroll_${pathname}`
    const restored = useRef(false)

    // Save scroll position on scroll (throttled)
    useEffect(() => {
        let ticking = false
        const handleScroll = () => {
            if (!ticking) {
                ticking = true
                requestAnimationFrame(() => {
                    sessionStorage.setItem(storageKey, String(window.scrollY))
                    ticking = false
                })
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [storageKey])

    // Restore scroll position once content is ready
    useEffect(() => {
        if (!isReady || restored.current) return

        const saved = sessionStorage.getItem(storageKey)
        if (saved) {
            // Small delay to allow DOM to render
            const raf = requestAnimationFrame(() => {
                window.scrollTo(0, parseInt(saved, 10))
                restored.current = true
            })
            return () => cancelAnimationFrame(raf)
        }
        restored.current = true
    }, [isReady, storageKey])
}
