import React from 'react';
import './Snackbar.css';
interface SnackbarProps {
    message: string;
    open: boolean;
    onClose: () => void;
    duration?: number;
    type?: 'info' | 'success' | 'warning' | 'error';
    className?: string;
}
export declare const Snackbar: React.FC<SnackbarProps>;
export {};
//# sourceMappingURL=Snackbar.d.ts.map