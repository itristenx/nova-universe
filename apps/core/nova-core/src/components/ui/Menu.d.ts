import React from 'react';
import './Menu.css';
interface MenuItem {
    label: string;
    onClick: () => void;
}
interface MenuProps {
    items: MenuItem[];
    buttonLabel: string;
    className?: string;
}
export declare const Menu: React.FC<MenuProps>;
export {};
//# sourceMappingURL=Menu.d.ts.map