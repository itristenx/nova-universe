import React from 'react';
export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose?: () => void;
}
export declare const Dialog: React.FC<DialogProps>;
//# sourceMappingURL=Dialog.d.ts.map
