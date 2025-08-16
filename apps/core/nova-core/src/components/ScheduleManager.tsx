import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useToastStore } from '@/stores/toast';
import type { DaySchedule, TimeSlot } from '@/types';

interface ScheduleManagerProps {
  title: string;
  config: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types;
  onSave: (config: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => Promise<void>;
  showEnabled?: boolean;
  showTitle?: boolean;
  showNextOpen?: boolean;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const TIMEZONES = [
  'America/New_York',
  'America/Chicago', 
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'UTC'
];

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  title,
  config,
  onSave,
  showEnabled = true,
  showTitle = false,
  showNextOpen = false
}) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(localConfig); // TODO-LINT: move to async function
      addToast({
        type: 'success',
        title: 'Success',
        description: `${title} updated successfully`,
      });
    } catch (error) {
      console.error(`Failed to update ${title}:`, error);
      addToast({
        type: 'error',
        title: 'Error',
        description: `Failed to update ${title}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDaySchedule = (dayKey: string, daySchedule: DaySchedule) => {
    setLocalConfig({
      ...localConfig,
      schedule: {
        ...localConfig.schedule,
        [dayKey]: daySchedule
      }
    });
  };

  const addTimeSlot = (dayKey: string) => {
    const currentDay = localConfig.schedule[dayKey];
    const newSlot: TimeSlot = { start: '09:00', end: '17:00' };
    updateDaySchedule(dayKey, {
      ...currentDay,
      slots: [...currentDay.slots, newSlot]
    });
  };

  const removeTimeSlot = (dayKey: string, slotIndex: number) => {
    const currentDay = localConfig.schedule[dayKey];
    updateDaySchedule(dayKey, {
      ...currentDay,
      slots: currentDay.slots.filter((_: TimeSlot, index: number) => index !== slotIndex)
    });
  };

  const updateTimeSlot = (dayKey: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    const currentDay = localConfig.schedule[dayKey];
    const updatedSlots = currentDay.slots.map((slot: TimeSlot, index: number) => 
      index === slotIndex ? { ...slot, [field]: value } : slot
    );
    updateDaySchedule(dayKey, {
      ...currentDay,
      slots: updatedSlots
    });
  };

  const toggleDay = (dayKey: string) => {
    const currentDay = localConfig.schedule[dayKey];
    updateDaySchedule(dayKey, {
      ...currentDay,
      enabled: !currentDay.enabled
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {showEnabled && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="schedule-enabled"
              checked={localConfig.enabled}
              onChange={(e) => setLocalConfig({ ...localConfig, enabled: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="schedule-enabled" className="text-sm font-medium text-gray-700">
              Enable {title}
            </label>
          </div>
        )}

        {showTitle && (
          <div>
            <Input
              label="Display Title"
              value={localConfig.title || ''}
              onChange={(e) => setLocalConfig({ ...localConfig, title: e.target.value })}
              placeholder="e.g., IT Support Hours"
            />
          </div>
        )}

        {showNextOpen && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="show-next-open"
              checked={localConfig.showNextOpen}
              onChange={(e) => setLocalConfig({ ...localConfig, showNextOpen: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="show-next-open" className="text-sm font-medium text-gray-700">
              Show "Next open" time when closed
            </label>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={localConfig.timezone || 'America/New_York'}
            onChange={(e) => setLocalConfig({ ...localConfig, timezone: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            title="Select timezone"
          >
            {TIMEZONES.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Weekly Schedule</h4>
          
          {DAYS.map(({ key, label }) => {
            const daySchedule = localConfig.schedule?.[key] || { enabled: false, slots: [] };
            
            return (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`day-${key}`}
                      checked={daySchedule.enabled}
                      onChange={() => toggleDay(key)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`day-${key}`} className="font-medium text-gray-900">
                      {label}
                    </label>
                  </div>
                  
                  {daySchedule.enabled && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => addTimeSlot(key)}
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Time Slot
                    </Button>
                  )}
                </div>

                {daySchedule.enabled && daySchedule.slots.map((slot: TimeSlot, index: number) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => updateTimeSlot(key, index, 'start', e.target.value)}
                      className="rounded border-gray-300 text-sm"
                      title="Start time"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => updateTimeSlot(key, index, 'end', e.target.value)}
                      className="rounded border-gray-300 text-sm"
                      title="End time"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => removeTimeSlot(key, index)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {daySchedule.enabled && daySchedule.slots.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No time slots configured</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
