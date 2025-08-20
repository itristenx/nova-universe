import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

interface KioskRedirectProps {
  className?: string
}

export default function KioskRedirect({ className = '' }: KioskRedirectProps) {
  const { t } = useTranslation(['app', 'common'])
  const navigate = useNavigate()
  const [isKioskMode, setIsKioskMode] = useState(false)

  useEffect(() => {
    // Check if running on a kiosk device
    const checkKioskMode = () => {
      // Check URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const kioskParam = urlParams.get('kiosk')
      
      // Check localStorage for kiosk configuration
      const kioskConfig = localStorage.getItem('kiosk-mode')
      
      // Check user agent for kiosk-specific patterns
      const userAgent = navigator.userAgent.toLowerCase()
      const isKioskUA = userAgent.includes('kiosk') || userAgent.includes('embedded')
      
      // Check screen characteristics (large touch screens)
      const isLargeTouch = window.screen.width >= 1024 && 'ontouchstart' in window
      
      // Check for kiosk-specific APIs or properties
      const hasKioskAPIs = 'presentation' in navigator || 'getDisplayMedia' in navigator.mediaDevices
      
      const isKiosk = kioskParam === 'true' || 
                     kioskConfig === 'true' || 
                     isKioskUA || 
                     (isLargeTouch && hasKioskAPIs)
      
      setIsKioskMode(isKiosk)
      
      if (isKiosk) {
        // Set kiosk-specific settings
        document.documentElement.classList.add('kiosk-mode')
        
        // Prevent right-click context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault())
        
        // Prevent text selection
        document.addEventListener('selectstart', (e) => e.preventDefault())
        
        // Setup session timeout for kiosk
        setupKioskSessionTimeout()
      }
    }

    checkKioskMode()
    
    return () => {
      document.documentElement.classList.remove('kiosk-mode')
    }
  }, [])

  const setupKioskSessionTimeout = () => {
    let timeoutId: NodeJS.Timeout
    
    const resetTimeout = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        // Auto-logout after inactivity
        localStorage.removeItem('auth-token')
        navigate('/auth/login?kiosk=true')
      }, 5 * 60 * 1000) // 5 minutes
    }

    // Reset timeout on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true)
    })

    resetTimeout()
  }

  if (!isKioskMode) {
    return null
  }

  return (
    <>
      {/* Kiosk-specific styles */}
      <style>{`
        .kiosk-mode {
          --touch-target-min: 44px;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        .kiosk-mode * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        .kiosk-mode input,
        .kiosk-mode textarea,
        .kiosk-mode [contenteditable] {
          -webkit-user-select: text;
          -khtml-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
        
        /* Larger touch targets for kiosk */
        .kiosk-mode button,
        .kiosk-mode .btn,
        .kiosk-mode input[type="submit"],
        .kiosk-mode input[type="button"] {
          min-height: var(--touch-target-min);
          min-width: var(--touch-target-min);
          padding: 12px 20px;
          font-size: 16px;
        }
        
        /* Hide scrollbars in kiosk mode */
        .kiosk-mode ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .kiosk-mode ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .kiosk-mode ::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.3);
          border-radius: 4px;
        }
        
        /* Prevent zoom on touch devices */
        .kiosk-mode {
          touch-action: manipulation;
        }
        
        /* Full screen styling */
        .kiosk-mode body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
      `}</style>
      
      {/* Kiosk header indicator */}
      <div className={`kiosk-indicator ${className}`}>
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-1 text-sm z-50">
          🖥️ {t('app.kiosk.modeActive')}
        </div>
      </div>
    </>
  )
}

// Hook for kiosk functionality
export function useKiosk() {
  const [isKioskMode, setIsKioskMode] = useState(false)
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const kioskParam = urlParams.get('kiosk')
    const kioskConfig = localStorage.getItem('kiosk-mode')
    
    setIsKioskMode(kioskParam === 'true' || kioskConfig === 'true')
  }, [])

  const enableKioskMode = () => {
    localStorage.setItem('kiosk-mode', 'true')
    setIsKioskMode(true)
    window.location.search = '?kiosk=true'
  }

  const disableKioskMode = () => {
    localStorage.removeItem('kiosk-mode')
    setIsKioskMode(false)
    // Remove kiosk parameter from URL
    const url = new URL(window.location.href)
    url.searchParams.delete('kiosk')
    window.history.replaceState({}, '', url.toString())
  }

  const extendSession = () => {
    // Reset session timeout
    const event = new CustomEvent('kioskSessionExtend')
    document.dispatchEvent(event)
  }

  return {
    isKioskMode,
    sessionTimeLeft,
    enableKioskMode,
    disableKioskMode,
    extendSession
  }
}
