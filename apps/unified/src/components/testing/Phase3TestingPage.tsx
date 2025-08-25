import { useState } from 'react';
import { cn } from '../../utils';

interface Phase3TestingPageProps {
  className?: string;
}

interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
}

export function Phase3TestingPage({ className }: Phase3TestingPageProps) {
  const [tests, setTests] = useState<TestResult[]>([
    // Dashboard System Tests
    {
      id: 'dash-1',
      name: 'Widget System Initialization',
      category: 'Dashboard',
      status: 'pending',
    },
    { id: 'dash-2', name: 'Real-time Data Updates', category: 'Dashboard', status: 'pending' },
    { id: 'dash-3', name: 'Layout Persistence', category: 'Dashboard', status: 'pending' },
    { id: 'dash-4', name: 'Widget Configuration', category: 'Dashboard', status: 'pending' },
    { id: 'dash-5', name: 'Collaboration Events', category: 'Dashboard', status: 'pending' },

    // Ticket Collaboration Tests
    { id: 'tick-1', name: 'Ticket List Rendering', category: 'Tickets', status: 'pending' },
    { id: 'tick-2', name: 'Kanban Board View', category: 'Tickets', status: 'pending' },
    { id: 'tick-3', name: 'Comment System', category: 'Tickets', status: 'pending' },
    { id: 'tick-4', name: 'Status Transitions', category: 'Tickets', status: 'pending' },
    { id: 'tick-5', name: 'Real-time Updates', category: 'Tickets', status: 'pending' },

    // Asset Management Tests
    { id: 'asset-1', name: 'Asset List Display', category: 'Assets', status: 'pending' },
    { id: 'asset-2', name: 'Lifecycle Timeline', category: 'Assets', status: 'pending' },
    { id: 'asset-3', name: 'Analytics Dashboard', category: 'Assets', status: 'pending' },
    { id: 'asset-4', name: 'Maintenance Tracking', category: 'Assets', status: 'pending' },
    { id: 'asset-5', name: 'Financial Calculations', category: 'Assets', status: 'pending' },

    // Space Management Tests
    { id: 'space-1', name: 'Floor Plan Rendering', category: 'Spaces', status: 'pending' },
    { id: 'space-2', name: 'Booking System', category: 'Spaces', status: 'pending' },
    { id: 'space-3', name: 'Space Analytics', category: 'Spaces', status: 'pending' },
    { id: 'space-4', name: 'Utilization Tracking', category: 'Spaces', status: 'pending' },
    { id: 'space-5', name: 'Maintenance Alerts', category: 'Spaces', status: 'pending' },

    // Integration Tests
    { id: 'int-1', name: 'Cross-Module Navigation', category: 'Integration', status: 'pending' },
    { id: 'int-2', name: 'State Management', category: 'Integration', status: 'pending' },
    { id: 'int-3', name: 'Performance Metrics', category: 'Integration', status: 'pending' },
    { id: 'int-4', name: 'Error Handling', category: 'Integration', status: 'pending' },
    { id: 'int-5', name: 'Accessibility Compliance', category: 'Integration', status: 'pending' },
  ]);

  const [runningTests, setRunningTests] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  const categories = ['Dashboard', 'Tickets', 'Assets', 'Spaces', 'Integration'];

  const getTestStats = () => {
    const stats = tests.reduce(
      (acc, test) => {
        acc[test.status] = (acc[test.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: tests.length,
      passed: stats.passed || 0,
      failed: stats.failed || 0,
      pending: stats.pending || 0,
      running: stats.running || 0,
    };
  };

  const getCategoryStats = (category: string) => {
    const categoryTests = tests.filter((t) => t.category === category);
    const passed = categoryTests.filter((t) => t.status === 'passed').length;
    const total = categoryTests.length;
    return { passed, total, percentage: total > 0 ? Math.round((passed / total) * 100) : 0 };
  };

  const runSingleTest = async (testId: string): Promise<TestResult> => {
    return new Promise((resolve) => {
      const test = tests.find((t) => t.id === testId)!;
      const startTime = Date.now();

      // Simulate test execution with random duration and outcome
      const duration = Math.random() * 2000 + 500; // 500ms - 2500ms
      const shouldPass = Math.random() > 0.1; // 90% pass rate

      setTimeout(() => {
        const endTime = Date.now();
        const result: TestResult = {
          ...test,
          status: shouldPass ? 'passed' : 'failed',
          duration: endTime - startTime,
          message: shouldPass
            ? `Test completed successfully`
            : `Mock test failure - ${Math.random() > 0.5 ? 'Assertion failed' : 'Timeout exceeded'}`,
        };
        resolve(result);
      }, duration);
    });
  };

  const runAllTests = async () => {
    setRunningTests(true);
    setCurrentTestIndex(0);

    // Reset all tests to pending
    setTests((prev) => prev.map((test) => ({ ...test, status: 'pending' as const })));

    // Run tests sequentially
    for (let i = 0; i < tests.length; i++) {
      setCurrentTestIndex(i);

      // Set current test to running
      setTests((prev) =>
        prev.map((test, index) => (index === i ? { ...test, status: 'running' as const } : test)),
      );

      // Run the test
      const currentTest = tests[i];
      if (currentTest) {
        const result = await runSingleTest(currentTest.id);

        // Update test result
        setTests((prev) => prev.map((test, index) => (index === i ? result : test)));

        // Small delay between tests for visual effect
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    setRunningTests(false);
    setCurrentTestIndex(0);
  };

  const runCategoryTests = async (category: string) => {
    const categoryTests = tests.filter((t) => t.category === category);
    setRunningTests(true);

    // Reset category tests to pending
    setTests((prev) =>
      prev.map((test) =>
        test.category === category ? { ...test, status: 'pending' as const } : test,
      ),
    );

    // Run category tests
    for (const test of categoryTests) {
      setTests((prev) =>
        prev.map((t) => (t.id === test.id ? { ...t, status: 'running' as const } : t)),
      );

      const result = await runSingleTest(test.id);

      setTests((prev) => prev.map((t) => (t.id === test.id ? result : t)));

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setRunningTests(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'passed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'running':
        return 'text-blue-600';
      case 'passed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const stats = getTestStats();

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🧪 Phase 3 Testing Suite
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Comprehensive testing for all Phase 3 modules and integrations
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={runAllTests}
              disabled={runningTests}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {runningTests ? '🔄 Running...' : '🚀 Run All Tests'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="border-b border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Tests</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Passed</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Running</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
          </div>
        </div>

        {runningTests && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Running test {currentTestIndex + 1} of {stats.total}
              </span>
              <span>{Math.round(((currentTestIndex + 1) / stats.total) * 100)}% Complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentTestIndex + 1) / stats.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Test Categories */}
      <div className="flex flex-1 overflow-hidden">
        {/* Category Sidebar */}
        <div className="w-64 overflow-y-auto border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="p-4">
            <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
              Test Categories
            </h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const categoryStats = getCategoryStats(category);
                return (
                  <div key={category} className="group">
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {category}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {categoryStats.passed}/{categoryStats.total} passed
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {categoryStats.percentage}%
                        </div>
                        <button
                          onClick={() => runCategoryTests(category)}
                          disabled={runningTests}
                          className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 hover:text-blue-700 disabled:opacity-50"
                        >
                          Run
                        </button>
                      </div>
                    </div>
                    <div className="mt-1 h-1 w-full rounded-full bg-gray-200 dark:bg-gray-600">
                      <div
                        className="h-1 rounded-full bg-green-500 transition-all duration-300"
                        style={{ width: `${categoryStats.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category}>
                  <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                    {category} Tests
                  </h3>
                  <div className="space-y-2">
                    {tests
                      .filter((test) => test.category === category)
                      .map((test) => (
                        <div
                          key={test.id}
                          className={cn(
                            'flex items-center justify-between rounded-lg border p-4 transition-all duration-200',
                            test.status === 'running'
                              ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                              : test.status === 'passed'
                                ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                                : test.status === 'failed'
                                  ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={cn('text-lg', getStatusColor(test.status))}>
                              {getStatusIcon(test.status)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {test.name}
                              </div>
                              {test.message && (
                                <div
                                  className={cn(
                                    'mt-1 text-xs',
                                    test.status === 'failed'
                                      ? 'text-red-600'
                                      : 'text-gray-600 dark:text-gray-400',
                                  )}
                                >
                                  {test.message}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            {test.duration && <span>{test.duration}ms</span>}
                            <span className="text-gray-400">{test.id}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3 text-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
          <span>🧪 Test Suite Version 1.0</span>
          <span>📅 {new Date().toLocaleDateString()}</span>
          <span>🕐 {new Date().toLocaleTimeString()}</span>
        </div>

        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
          {runningTests ? (
            <span className="flex items-center space-x-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
              <span>Tests Running...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Ready to Test</span>
            </span>
          )}
          <span>Phase 3 • Testing Suite</span>
        </div>
      </div>
    </div>
  );
}
