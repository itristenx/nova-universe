import React from 'react';
import type { Kiosk, GlobalConfiguration } from '@/types';
interface KioskConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  kiosk: Kiosk;
  globalConfig: GlobalConfiguration;
  onUpdate: () => void;
}
export declare const KioskConfigurationModal: React.FC<KioskConfigurationModalProps>;
export {};
//# sourceMappingURL=KioskConfigurationModal.d.ts.map
