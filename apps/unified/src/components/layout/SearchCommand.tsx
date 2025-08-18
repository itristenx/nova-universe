import { useTranslation } from 'react-i18next'

interface SearchCommandProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchCommand({ isOpen, onClose }: SearchCommandProps) {
  const { t } = useTranslation(['navigation', 'common'])
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4">{t('navigation.search')}</h3>
        <input
          type="text"
          placeholder={t('navigation.searchPlaceholder')}
          className="input w-full"
          autoFocus
        />
        <button
          onClick={onClose}
          className="btn btn-secondary mt-4"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  )
}