import React from 'react';

const UpdateBanner: React.FC = () => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onUpdate = () => setVisible(true);
    window.addEventListener('sw-update-available', onUpdate as any);
    return () => window.removeEventListener('sw-update-available', onUpdate as any);
  }, []);

  if (!visible) return null;

  return (
    <div className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 fixed bottom-[calc(3.5rem+var(--safe-bottom))] left-1/2 z-[95] flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-gray-900/95 px-4 py-3 text-white shadow backdrop-blur dark:bg-gray-800/95">
      <span className="text-sm">A new version is available</span>
      <button
        className="bg-primary-600 rounded-xl px-3 py-1.5 text-sm text-white"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
      <button
        className="rounded-xl bg-gray-700 px-3 py-1.5 text-sm text-white"
        onClick={() => setVisible(false)}
      >
        Later
      </button>
    </div>
  );
};

export default UpdateBanner;
