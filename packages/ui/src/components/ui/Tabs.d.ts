import React from 'react';
import './Tabs.css';
interface Tab {
    label: string;
    content: React.ReactNode;
}
interface TabsProps {
    tabs: Tab[];
    initialIndex?: number;
    className?: string;
}
export declare const Tabs: React.FC<TabsProps>;
export {};
//# sourceMappingURL=Tabs.d.ts.map