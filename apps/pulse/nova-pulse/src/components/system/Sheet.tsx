import React from 'react';
import { motion, PanInfo } from 'framer-motion';

type SheetProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | string;
  title?: string;
};

const Sheet: React.FC<SheetProps> = ({ isOpen, onClose, children, height = '80vh', title }) => {
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 80 || info.velocity.y > 800) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1500]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white shadow-xl dark:bg-gray-900"
        style={{ height }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
      >
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
        {title && <div className="py-2 text-center text-sm font-medium">{title}</div>}
        <div className="h-[calc(100%-2.5rem)] overflow-auto px-4 pb-6">{children}</div>
      </motion.div>
    </div>
  );
};

export default Sheet;
