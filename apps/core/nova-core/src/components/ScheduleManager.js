import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useToastStore } from '@/stores/toast';
const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];
const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'UTC',
];
export const ScheduleManager = ({
  title,
  config,
  onSave,
  showEnabled = true,
  showTitle = false,
  showNextOpen = false,
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
      await onSave(localConfig);
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
  const updateDaySchedule = (dayKey, daySchedule) => {
    setLocalConfig({
      ...localConfig,
      schedule: {
        ...localConfig.schedule,
        [dayKey]: daySchedule,
      },
    });
  };
  const addTimeSlot = (dayKey) => {
    const currentDay = localConfig.schedule[dayKey];
    const newSlot = { start: '09:00', end: '17:00' };
    updateDaySchedule(dayKey, {
      ...currentDay,
      slots: [...currentDay.slots, newSlot],
    });
  };
  const removeTimeSlot = (dayKey, slotIndex) => {
    const currentDay = localConfig.schedule[dayKey];
    updateDaySchedule(dayKey, {
      ...currentDay,
      slots: currentDay.slots.filter((_, index) => index !== slotIndex),
    });
  };
  const updateTimeSlot = (dayKey, slotIndex, field, value) => {
    const currentDay = localConfig.schedule[dayKey];
    const updatedSlots = currentDay.slots.map((slot, index) =>
      index === slotIndex ? { ...slot, [field]: value } : slot,
    );
    updateDaySchedule(dayKey, {
      ...currentDay,
      slots: updatedSlots,
    });
  };
  const toggleDay = (dayKey) => {
    const currentDay = localConfig.schedule[dayKey];
    updateDaySchedule(dayKey, {
      ...currentDay,
      enabled: !currentDay.enabled,
    });
  };
  return React.createElement(
    Card,
    { className: 'p-6' },
    React.createElement(
      'div',
      { className: 'space-y-6' },
      React.createElement(
        'div',
        { className: 'flex items-center justify-between' },
        React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, title),
        React.createElement(
          Button,
          { variant: 'primary', onClick: handleSave, disabled: loading },
          loading ? 'Saving...' : 'Save Changes',
        ),
      ),
      showEnabled &&
        React.createElement(
          'div',
          { className: 'flex items-center space-x-2' },
          React.createElement('input', {
            type: 'checkbox',
            id: 'schedule-enabled',
            checked: localConfig.enabled,
            onChange: (e) => setLocalConfig({ ...localConfig, enabled: e.target.checked }),
            className: 'rounded border-gray-300',
          }),
          React.createElement(
            'label',
            { htmlFor: 'schedule-enabled', className: 'text-sm font-medium text-gray-700' },
            'Enable ',
            title,
          ),
        ),
      showTitle &&
        React.createElement(
          'div',
          null,
          React.createElement(Input, {
            label: 'Display Title',
            value: localConfig.title || '',
            onChange: (e) => setLocalConfig({ ...localConfig, title: e.target.value }),
            placeholder: 'e.g., IT Support Hours',
          }),
        ),
      showNextOpen &&
        React.createElement(
          'div',
          { className: 'flex items-center space-x-2' },
          React.createElement('input', {
            type: 'checkbox',
            id: 'show-next-open',
            checked: localConfig.showNextOpen,
            onChange: (e) => setLocalConfig({ ...localConfig, showNextOpen: e.target.checked }),
            className: 'rounded border-gray-300',
          }),
          React.createElement(
            'label',
            { htmlFor: 'show-next-open', className: 'text-sm font-medium text-gray-700' },
            'Show "Next open" time when closed',
          ),
        ),
      React.createElement(
        'div',
        null,
        React.createElement(
          'label',
          { className: 'block text-sm font-medium text-gray-700 mb-2' },
          'Timezone',
        ),
        React.createElement(
          'select',
          {
            value: localConfig.timezone || 'America/New_York',
            onChange: (e) => setLocalConfig({ ...localConfig, timezone: e.target.value }),
            className:
              'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
            title: 'Select timezone',
          },
          TIMEZONES.map((tz) => React.createElement('option', { key: tz, value: tz }, tz)),
        ),
      ),
      React.createElement(
        'div',
        { className: 'space-y-4' },
        React.createElement(
          'h4',
          { className: 'text-md font-medium text-gray-900' },
          'Weekly Schedule',
        ),
        DAYS.map(({ key, label }) => {
          const daySchedule = localConfig.schedule?.[key] || { enabled: false, slots: [] };
          return React.createElement(
            'div',
            { key: key, className: 'border border-gray-200 rounded-lg p-4' },
            React.createElement(
              'div',
              { className: 'flex items-center justify-between mb-3' },
              React.createElement(
                'div',
                { className: 'flex items-center space-x-2' },
                React.createElement('input', {
                  type: 'checkbox',
                  id: `day-${key}`,
                  checked: daySchedule.enabled,
                  onChange: () => toggleDay(key),
                  className: 'rounded border-gray-300',
                }),
                React.createElement(
                  'label',
                  { htmlFor: `day-${key}`, className: 'font-medium text-gray-900' },
                  label,
                ),
              ),
              daySchedule.enabled &&
                React.createElement(
                  Button,
                  { variant: 'secondary', size: 'sm', onClick: () => addTimeSlot(key) },
                  React.createElement(PlusIcon, { className: 'h-4 w-4 mr-1' }),
                  'Add Time Slot',
                ),
            ),
            daySchedule.enabled &&
              daySchedule.slots.map((slot, index) =>
                React.createElement(
                  'div',
                  { key: index, className: 'flex items-center space-x-2 mb-2' },
                  React.createElement('input', {
                    type: 'time',
                    value: slot.start,
                    onChange: (e) => updateTimeSlot(key, index, 'start', e.target.value),
                    className: 'rounded border-gray-300 text-sm',
                    title: 'Start time',
                  }),
                  React.createElement('span', { className: 'text-gray-500' }, 'to'),
                  React.createElement('input', {
                    type: 'time',
                    value: slot.end,
                    onChange: (e) => updateTimeSlot(key, index, 'end', e.target.value),
                    className: 'rounded border-gray-300 text-sm',
                    title: 'End time',
                  }),
                  React.createElement(
                    Button,
                    { variant: 'secondary', size: 'sm', onClick: () => removeTimeSlot(key, index) },
                    React.createElement(TrashIcon, { className: 'h-4 w-4' }),
                  ),
                ),
              ),
            daySchedule.enabled &&
              daySchedule.slots.length === 0 &&
              React.createElement(
                'p',
                { className: 'text-sm text-gray-500 italic' },
                'No time slots configured',
              ),
          );
        }),
      ),
    ),
  );
};
