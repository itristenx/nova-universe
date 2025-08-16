'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Timezone and cultural information
interface CulturalInfo {
  locale: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  numberFormat: string;
  currency: string;
  firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  rtl: boolean;
}

const CULTURAL_INFO: Record<string, CulturalInfo> = {
  en: {
    locale: 'en-US',
    timezone: 'America/New_York',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    numberFormat: 'en-US',
    currency: 'USD',
    firstDayOfWeek: 0,
    rtl: false
  },
  es: {
    locale: 'es-ES',
    timezone: 'Europe/Madrid',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    numberFormat: 'es-ES',
    currency: 'EUR',
    firstDayOfWeek: 1,
    rtl: false
  },
  fr: {
    locale: 'fr-FR',
    timezone: 'Europe/Paris',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    numberFormat: 'fr-FR',
    currency: 'EUR',
    firstDayOfWeek: 1,
    rtl: false
  },
  ar: {
    locale: 'ar-SA',
    timezone: 'Asia/Riyadh',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '12h',
    numberFormat: 'ar-SA',
    currency: 'SAR',
    firstDayOfWeek: 0,
    rtl: true
  }
};

// Hook for cultural formatting
export function useCulturalFormatting() {
  const locale = useLocale();
  const culturalInfo = CULTURAL_INFO[locale] || CULTURAL_INFO.en;

  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(culturalInfo.locale, {
      timeZone: culturalInfo.timezone,
      ...options
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(culturalInfo.locale, {
      timeZone: culturalInfo.timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: culturalInfo.timeFormat === '12h'
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat(culturalInfo.locale, {
      timeZone: culturalInfo.timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: culturalInfo.timeFormat === '12h'
    }).format(date);
  };

  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(culturalInfo.numberFormat, options).format(number);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(culturalInfo.numberFormat, {
      style: 'currency',
      currency: culturalInfo.currency
    }).format(amount);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const rtf = new Intl.RelativeTimeFormat(culturalInfo.locale, { numeric: 'auto' });
    
    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    }
  };

  return {
    culturalInfo,
    formatDate,
    formatTime,
    formatDateTime,
    formatNumber,
    formatCurrency,
    formatRelativeTime
  };
}

// Component for displaying formatted dates and times
interface DateTimeDisplayProps {
  date: Date;
  format?: 'date' | 'time' | 'datetime' | 'relative';
  className?: string;
}

export function DateTimeDisplay({ date, format = 'datetime', className = '' }: DateTimeDisplayProps) {
  const { formatDate, formatTime, formatDateTime, formatRelativeTime } = useCulturalFormatting();

  const getFormattedValue = () => {
    switch (format) {
      case 'date':
        return formatDate(date);
      case 'time':
        return formatTime(date);
      case 'relative':
        return formatRelativeTime(date);
      default:
        return formatDateTime(date);
    }
  };

  return (
    <time dateTime={date.toISOString()} className={className}>
      {getFormattedValue()}
    </time>
  );
}

// Component for displaying formatted numbers and currency
interface NumberDisplayProps {
  value: number;
  format?: 'number' | 'currency' | 'percentage';
  className?: string;
}

export function NumberDisplay({ value, format = 'number', className = '' }: NumberDisplayProps) {
  const { formatNumber, formatCurrency } = useCulturalFormatting();

  const getFormattedValue = () => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatNumber(value, { style: 'percent' });
      default:
        return formatNumber(value);
    }
  };

  return <span className={className}>{getFormattedValue()}</span>;
}

// Timezone selector component
export function _TimezoneSelector() {
  const locale = useLocale();
  const [selectedTimezone, setSelectedTimezone] = React.useState(
    CULTURAL_INFO[locale]?.timezone || 'UTC'
  );

  const commonTimezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Madrid',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Riyadh',
    'Australia/Sydney'
  ];

  const getTimezoneDisplay = (timezone: string) => {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    const parts = formatter.formatToParts(date);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || timezone;
    
    return `${timezone.replace('_', ' ')} (${timeZoneName})`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Timezone Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <select
          value={selectedTimezone}
          onChange={(e) => setSelectedTimezone(e.target.value)}
          className="w-full p-2 border rounded-md bg-background"
          title="Select timezone"
          aria-label="Select timezone"
        >
          {commonTimezones.map((timezone) => (
            <option key={timezone} value={timezone}>
              {getTimezoneDisplay(timezone)}
            </option>
          ))}
        </select>
        
        <div className="mt-4 p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Current Time</span>
          </div>
          <DateTimeDisplay 
            date={new Date()} 
            format="datetime"
            className="text-sm text-muted-foreground"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Cultural preferences component
export function _CulturalPreferences() {
  const locale = useLocale();
  const culturalInfo = CULTURAL_INFO[locale] || CULTURAL_INFO.en;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Cultural Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Date Format</span>
            <div className="font-medium">{culturalInfo.dateFormat}</div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Time Format</span>
            <div className="font-medium">{culturalInfo.timeFormat}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Currency</span>
            <div className="font-medium">{culturalInfo.currency}</div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">First Day of Week</span>
            <div className="font-medium">
              {culturalInfo.firstDayOfWeek === 0 ? 'Sunday' : 'Monday'}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            Timezone: {culturalInfo.timezone}
          </Badge>
          {culturalInfo.rtl && (
            <Badge variant="secondary">
              RTL Layout
            </Badge>
          )}
        </div>
        
        <div className="mt-4 p-3 bg-muted rounded-md">
          <div className="text-sm text-muted-foreground mb-2">Sample Formatting</div>
          <div className="space-y-1 text-sm">
            <div>Date: <DateTimeDisplay date={new Date()} format="date" /></div>
            <div>Time: <DateTimeDisplay date={new Date()} format="time" /></div>
            <div>Number: <NumberDisplay value={1234.56} /></div>
            <div>Currency: <NumberDisplay value={1234.56} format="currency" /></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
