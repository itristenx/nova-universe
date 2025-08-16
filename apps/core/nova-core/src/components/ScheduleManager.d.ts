import React from 'react';
interface ScheduleManagerProps {
  title: string;
  config: any;
  onSave: (config: any) => Promise<void>;
  showEnabled?: boolean;
  showTitle?: boolean;
  showNextOpen?: boolean;
}
export declare const ScheduleManager: React.FC<ScheduleManagerProps>;
export {};
//# sourceMappingURL=ScheduleManager.d.ts.map
