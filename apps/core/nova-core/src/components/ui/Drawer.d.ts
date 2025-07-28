import React from 'react';
import './Drawer.css';
interface DrawerProps {
    open: boolean;
    onClose: () => void;
    side?: 'left' | 'right';
    children: React.ReactNode;
    className?: string;
}
export declare const Drawer: React.FC<DrawerProps>;
export {};
//# sourceMappingURL=Drawer.d.ts.map