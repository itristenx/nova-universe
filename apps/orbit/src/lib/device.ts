// Device detection utility for kiosk/tablet mode
export function _isTabletOrKiosk(userAgent: _string): boolean {
  // Simple user agent check for iPad, Android tablets, or kiosk browsers
  return /iPad|Android(?!.*Mobile)|Tablet|Kiosk/i.test(userAgent);
}
