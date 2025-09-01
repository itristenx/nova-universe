import {
  cn,
  formatBytes,
  formatDate,
  formatRelativeTime,
  capitalize,
  truncate,
  slugify,
  getInitials,
  getUserDisplayName,
  isValidEmail,
  isValidPhone,
  formatPhoneNumber,
  debounce,
  throttle,
  deepClone,
  pick,
  omit,
  isEmpty,
  generateId,
  range,
  groupBy,
  sortBy,
  unique,
  uniqueBy,
  chunk,
  flatten,
  calculatePercentage,
  formatPercentage,
  parseSearchQuery,
  buildSearchQuery,
  formatCurrency,
  formatNumber,
} from '../utils/index';

// Mock external dependencies
jest.mock('clsx', () => ({
  clsx: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

jest.mock('tailwind-merge', () => ({
  twMerge: jest.fn((classes) => classes),
}));

jest.mock('date-fns', () => ({
  format: jest.fn(() => 'formatted date'),
  formatDistance: jest.fn(() => '2 days ago'),
  formatRelative: jest.fn(() => 'last Friday'),
  isValid: jest.fn(() => true),
  parseISO: jest.fn((date) => new Date(date)),
}));

describe('Utils', () => {
  describe('cn', () => {
    test('should merge classes', () => {
      const result = cn('class1', 'class2');
      expect(result).toBeDefined();
    });
  });

  describe('formatBytes', () => {
    test('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });

    test('should handle decimals', () => {
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
      expect(formatBytes(1536, 0)).toBe('2 KB');
    });
  });

  describe('capitalize', () => {
    test('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('HELLO');
      expect(capitalize('hELLO')).toBe('HELLO');
      expect(capitalize('')).toBe('');
    });
  });

  describe('truncate', () => {
    test('should truncate long text', () => {
      expect(truncate('Hello world', 5)).toBe('Hello...');
      expect(truncate('Hi', 5)).toBe('Hi');
    });
  });

  describe('slugify', () => {
    test('should create URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Hello   World')).toBe('hello-world');
      expect(slugify('Hello, World!')).toBe('hello-world');
    });
  });

  describe('getInitials', () => {
    test('should get initials from name', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('John')).toBe('J');
      expect(getInitials('John Michael Doe')).toBe('JM');
    });
  });

  describe('getUserDisplayName', () => {
    test('should return display name if available', () => {
      const user = { firstName: 'John', lastName: 'Doe', displayName: 'Johnny' };
      expect(getUserDisplayName(user)).toBe('Johnny');
    });

    test('should combine first and last name if no display name', () => {
      const user = { firstName: 'John', lastName: 'Doe' };
      expect(getUserDisplayName(user)).toBe('John Doe');
    });
  });

  describe('isValidEmail', () => {
    test('should validate email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    test('should validate phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
    });
  });

  describe('formatPhoneNumber', () => {
    test('should format 10-digit numbers', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    });

    test('should format 11-digit numbers starting with 1', () => {
      expect(formatPhoneNumber('11234567890')).toBe('+1 (123) 456-7890');
    });

    test('should return original for other formats', () => {
      expect(formatPhoneNumber('123')).toBe('123');
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    test('should debounce function calls', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('throttle', () => {
    jest.useFakeTimers();

    test('should throttle function calls', () => {
      const fn = jest.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(fn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(2);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('deepClone', () => {
    test('should deep clone objects', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
    });

    test('should handle arrays', () => {
      const original = [1, [2, 3], 4];
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[1]).not.toBe(original[1]);
    });

    test('should handle dates', () => {
      const original = new Date();
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });
  });

  describe('pick', () => {
    test('should pick specified properties', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const picked = pick(obj, ['a', 'c']);

      expect(picked).toEqual({ a: 1, c: 3 });
    });
  });

  describe('omit', () => {
    test('should omit specified properties', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const omitted = omit(obj, ['b']);

      expect(omitted).toEqual({ a: 1, c: 3 });
    });
  });

  describe('isEmpty', () => {
    test('should check if values are empty', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe('generateId', () => {
    test('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    test('should include prefix', () => {
      const id = generateId('test-');
      expect(id.startsWith('test-')).toBe(true);
    });
  });

  describe('range', () => {
    test('should create range of numbers', () => {
      expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]);
      expect(range(1, 4)).toEqual([1, 2, 3]);
      expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
    });
  });

  describe('groupBy', () => {
    test('should group array items by key', () => {
      const items = [
        { type: 'fruit', name: 'apple' },
        { type: 'fruit', name: 'banana' },
        { type: 'vegetable', name: 'carrot' },
      ];

      const grouped = groupBy(items, 'type');

      expect(grouped.fruit).toHaveLength(2);
      expect(grouped.vegetable).toHaveLength(1);
    });
  });

  describe('sortBy', () => {
    test('should sort array by key', () => {
      const items = [{ age: 30 }, { age: 20 }, { age: 25 }];

      const sorted = sortBy(items, 'age');
      expect(sorted[0].age).toBe(20);
      expect(sorted[2].age).toBe(30);

      const sortedDesc = sortBy(items, 'age', 'desc');
      expect(sortedDesc[0].age).toBe(30);
      expect(sortedDesc[2].age).toBe(20);
    });
  });

  describe('unique', () => {
    test('should return unique items', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
    });
  });

  describe('uniqueBy', () => {
    test('should return unique items by key', () => {
      const items = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 1, name: 'Johnny' },
      ];

      const uniqueItems = uniqueBy(items, 'id');
      expect(uniqueItems).toHaveLength(2);
      expect(uniqueItems[0].name).toBe('John');
      expect(uniqueItems[1].name).toBe('Jane');
    });
  });

  describe('chunk', () => {
    test('should create chunks from array', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
    });
  });

  describe('flatten', () => {
    test('should flatten array', () => {
      expect(flatten([1, [2, 3], 4])).toEqual([1, 2, 3, 4]);
      expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
    });
  });

  describe('calculatePercentage', () => {
    test('should calculate percentage', () => {
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(1, 3)).toBe(33);
      expect(calculatePercentage(0, 100)).toBe(0);
      expect(calculatePercentage(100, 0)).toBe(0);
    });
  });

  describe('formatPercentage', () => {
    test('should format percentage', () => {
      expect(formatPercentage(50)).toBe('50%');
      expect(formatPercentage(25, 100)).toBe('25%');
    });
  });

  describe('parseSearchQuery', () => {
    test('should parse search query', () => {
      const result = parseSearchQuery('hello world status:open priority:high');
      
      expect(result.terms).toEqual(['hello', 'world']);
      expect(result.filters.status).toEqual(['open']);
      expect(result.filters.priority).toEqual(['high']);
    });
  });

  describe('buildSearchQuery', () => {
    test('should build search query', () => {
      const query = buildSearchQuery(
        ['hello', 'world'],
        { status: ['open'], priority: ['high'] }
      );

      expect(query).toContain('hello');
      expect(query).toContain('world');
      expect(query).toContain('status:open');
      expect(query).toContain('priority:high');
    });
  });

  describe('formatCurrency', () => {
    test('should format currency', () => {
      // Mock Intl.NumberFormat
      const mockFormat = jest.fn(() => '$100.00');
      global.Intl.NumberFormat = jest.fn(() => ({ format: mockFormat }));

      const result = formatCurrency(100);
      expect(mockFormat).toHaveBeenCalledWith(100);
    });
  });

  describe('formatNumber', () => {
    test('should format number', () => {
      // Mock Intl.NumberFormat
      const mockFormat = jest.fn(() => '1,000');
      global.Intl.NumberFormat = jest.fn(() => ({ format: mockFormat }));

      const result = formatNumber(1000);
      expect(mockFormat).toHaveBeenCalledWith(1000);
    });
  });
});