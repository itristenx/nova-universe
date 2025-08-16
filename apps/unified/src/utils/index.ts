import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistance, formatRelative, isValid, parseISO } from 'date-fns'
import type { TicketPriority, TicketStatus, TicketType } from '@/types'

/**
 * Utility function to merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility function to format bytes to human readable format
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Utility function to format dates consistently
 */
export function formatDate(
  date: string | Date,
  formatStr = 'MMM dd, yyyy'
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? format(dateObj, formatStr) : 'Invalid date'
  } catch {
    return 'Invalid date'
  }
}

/**
 * Utility function to format relative time
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? formatDistance(dateObj, new Date(), { addSuffix: true }) : 'Invalid date'
  } catch {
    return 'Invalid date'
  }
}

/**
 * Utility function to format date relative to now
 */
export function formatRelativeDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? formatRelative(dateObj, new Date()) : 'Invalid date'
  } catch {
    return 'Invalid date'
  }
}

/**
 * Utility function to capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Utility function to truncate text
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

/**
 * Utility function to slugify text
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * Utility function to generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Utility function to generate avatar URL or return initials
 */
export function getAvatarUrl(user: { firstName: string; lastName: string; avatar?: string }): string | null {
  if (user.avatar) return user.avatar
  return null
}

/**
 * Utility function to get user display name
 */
export function getUserDisplayName(user: { firstName: string; lastName: string; displayName?: string }): string {
  if (user.displayName) return user.displayName
  return `${user.firstName} ${user.lastName}`.trim()
}

/**
 * Utility function to validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Utility function to validate phone number
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

/**
 * Utility function to format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')
  }
  
  return phone
}

/**
 * Utility function to debounce function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Utility function to throttle function calls
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Utility function to deep clone objects
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * Utility function to pick properties from object
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }
  return result
}

/**
 * Utility function to omit properties from object
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  for (const key of keys) {
    delete result[key]
  }
  return result
}

/**
 * Utility function to check if object is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Utility function to generate random ID
 */
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 8)
  return `${prefix}${timestamp}${randomPart}`
}

/**
 * Utility function to sleep/delay execution
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Utility function to create a range of numbers
 */
export function range(start: number, end: number, step = 1): number[] {
  const result: number[] = []
  for (let i = start; i < end; i += step) {
    result.push(i)
  }
  return result
}

/**
 * Utility function to group array items by key
 */
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key])
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * Utility function to sort array of objects
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key]
    const bValue = b[key]
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Utility function to get unique items from array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * Utility function to get unique items by key
 */
export function uniqueBy<T, K extends keyof T>(array: T[], key: K): T[] {
  const seen = new Set()
  return array.filter(item => {
    const keyValue = item[key]
    if (seen.has(keyValue)) {
      return false
    }
    seen.add(keyValue)
    return true
  })
}

/**
 * Utility function to create chunks from array
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Utility function to flatten array
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.reduce<T[]>((acc, item) => {
    if (Array.isArray(item)) {
      acc.push(...item)
    } else {
      acc.push(item)
    }
    return acc
  }, [])
}

/**
 * Utility function to get ticket priority color
 */
export function getTicketPriorityColor(priority: TicketPriority): string {
  const colors = {
    low: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300',
    normal: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
    high: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300',
    urgent: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
    critical: 'text-red-800 bg-red-200 dark:bg-red-800 dark:text-red-200',
  }
  return colors[priority] || colors.normal
}

/**
 * Utility function to get ticket status color
 */
export function getTicketStatusColor(status: TicketStatus): string {
  const colors = {
    new: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
    open: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
    pending: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300',
    resolved: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
    closed: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300',
    canceled: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
  }
  return colors[status] || colors.new
}

/**
 * Utility function to get asset status color
 */
export function getAssetStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
    inactive: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300',
    maintenance: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
    retired: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
    lost: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300',
    stolen: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
  }
  return colors[status] || colors.active
}

/**
 * Utility function to get ticket type icon
 */
export function getTicketTypeIcon(type: TicketType): string {
  const icons = {
    incident: 'ExclamationTriangleIcon',
    request: 'PlusCircleIcon',
    problem: 'BugAntIcon',
    change: 'ArrowPathIcon',
    task: 'CheckCircleIcon',
    hr: 'UserGroupIcon',
    ops: 'CogIcon',
    isac: 'ShieldCheckIcon',
    feedback: 'ChatBubbleLeftRightIcon',
  }
  return icons[type] || icons.request
}

/**
 * Utility function to format ticket number
 */
export function formatTicketNumber(number: string, type?: TicketType): string {
  const prefixes = {
    incident: 'INC',
    request: 'REQ',
    problem: 'PRB',
    change: 'CHG',
    task: 'TSK',
    hr: 'HR',
    ops: 'OPS',
    isac: 'SEC',
    feedback: 'FB',
  }
  
  if (type && prefixes[type]) {
    return `${prefixes[type]}-${number}`
  }
  
  return number
}

/**
 * Utility function to parse search query
 */
export function parseSearchQuery(query: string): {
  terms: string[]
  filters: Record<string, string[]>
} {
  const terms: string[] = []
  const filters: Record<string, string[]> = {}
  
  const parts = query.split(/\s+/)
  
  for (const part of parts) {
    if (part.includes(':')) {
      const [key, value] = part.split(':', 2)
      if (key && value) {
        if (!filters[key]) {
          filters[key] = []
        }
        filters[key].push(value)
      }
    } else if (part.trim()) {
      terms.push(part.trim())
    }
  }
  
  return { terms, filters }
}

/**
 * Utility function to build search query
 */
export function buildSearchQuery(terms: string[], filters: Record<string, string[]>): string {
  const parts: string[] = [...terms]
  
  for (const [key, values] of Object.entries(filters)) {
    for (const value of values) {
      parts.push(`${key}:${value}`)
    }
  }
  
  return parts.join(' ')
}

/**
 * Utility function to calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Utility function to format percentage
 */
export function formatPercentage(value: number, total?: number): string {
  if (total !== undefined) {
    const percentage = calculatePercentage(value, total)
    return `${percentage}%`
  }
  return `${value}%`
}

/**
 * Utility function to copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'absolute'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        return true
      } catch {
        return false
      } finally {
        document.body.removeChild(textArea)
      }
    }
  } catch {
    return false
  }
}

/**
 * Utility function to download file
 */
export function downloadFile(data: Blob | string, filename: string, mimeType?: string): void {
  const blob = typeof data === 'string' 
    ? new Blob([data], { type: mimeType || 'text/plain' })
    : data
  
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Utility function to detect mobile device
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Utility function to detect touch device
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Utility function to get device type
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth
  
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/**
 * Utility function to scroll to element
 */
export function scrollToElement(elementId: string, offset = 0): void {
  const element = document.getElementById(elementId)
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
    const offsetPosition = elementPosition - offset
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

/**
 * Utility function to format currency
 */
export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Utility function to format number
 */
export function formatNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value)
}

/**
 * Environment utilities
 */
export const env = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
} as const