import React from 'react'

const UpdateBanner: React.FC = () => {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const onUpdate = () => setVisible(true)
    window.addEventListener('sw-update-available', onUpdate as any)
    return () => window.removeEventListener('sw-update-available', onUpdate as any)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-[calc(3.5rem+var(--safe-bottom))] left-1/2 -translate-x-1/2 z-[95] bg-gray-900/95 text-white dark:bg-gray-800/95 backdrop-blur rounded-2xl shadow px-4 py-3 flex items-center gap-3 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2">
      <span className="text-sm">A new version is available</span>
      <button
        className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-sm"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
      <button
        className="px-3 py-1.5 rounded-xl bg-gray-700 text-white text-sm"
        onClick={() => setVisible(false)}
      >
        Later
      </button>
    </div>
  )
}

export default UpdateBanner


