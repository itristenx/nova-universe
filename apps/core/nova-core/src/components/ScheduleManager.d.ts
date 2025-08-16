import React from 'react';
interface ScheduleManagerProps {
    title: string;
    config: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types;
    onSave: (config: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => Promise<void>;
    showEnabled?: boolean;
    showTitle?: boolean;
    showNextOpen?: boolean;
}
export declare const ScheduleManager: React.FC<ScheduleManagerProps>;
export {};
//# sourceMappingURL=ScheduleManager.d.ts.map