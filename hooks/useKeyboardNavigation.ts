import { useEffect } from 'react'

type KeyboardHandler = () => void

export function useKeyboardNavigation(
  handleFunction: KeyboardHandler,
  dependencies: any[] = [],
  excludeTextarea: boolean = true,
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger on textarea elements
      if (
        e.key === 'Enter' &&
        (!excludeTextarea ||
          (e.target instanceof HTMLElement && e.target.tagName !== 'TEXTAREA'))
      ) {
        e.preventDefault()
        handleFunction()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, dependencies)
}
