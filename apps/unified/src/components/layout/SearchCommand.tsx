import { useTranslation } from 'react-i18next';

interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchCommand({ isOpen, onClose }: SearchCommandProps) {
  const { t } = useTranslation(['navigation', 'common']);

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold">{t('navigation.search')}</h3>
        <input
          type="text"
          placeholder={t('navigation.searchPlaceholder')}
          className="input w-full"
          autoFocus
        />
        <button onClick={onClose} className="btn btn-secondary mt-4">
          {t('common.close')}
        </button>
      </div>
    </div>
  );
}
