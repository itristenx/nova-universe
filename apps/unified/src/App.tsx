import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@stores/auth'
import { AuthGuard } from '@components/common/AuthGuard'
import { AppLayout } from '@components/layout/AppLayout'
import { AuthLayout } from '@components/layout/AuthLayout'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { ErrorBoundary } from '@components/common/ErrorBoundary'

// Lazy load pages for better performance
import { lazy, Suspense } from 'react'

// Authentication pages
const LoginPage = lazy(() => import('@pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@pages/auth/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('@pages/auth/VerifyEmailPage'))

// Dashboard pages
const DashboardPage = lazy(() => import('@pages/dashboard/DashboardPage'))
const AdminDashboard = lazy(() => import('@pages/dashboard/AdminDashboard'))
const AgentDashboard = lazy(() => import('@pages/dashboard/AgentDashboard'))
const UserDashboard = lazy(() => import('@pages/dashboard/UserDashboard'))

// Ticket pages
const TicketsPage = lazy(() => import('@pages/tickets/TicketsPage'))
const TicketDetailPage = lazy(() => import('@pages/tickets/TicketDetailPage'))
const CreateTicketPage = lazy(() => import('@pages/tickets/CreateTicketPage'))

// Asset pages
const AssetsPage = lazy(() => import('@pages/assets/AssetsPage'))
const AssetDetailPage = lazy(() => import('@pages/assets/AssetDetailPage'))
const CreateAssetPage = lazy(() => import('@pages/assets/CreateAssetPage'))

// Space pages
const SpacesPage = lazy(() => import('@pages/spaces/SpacesPage'))
const SpaceDetailPage = lazy(() => import('@pages/spaces/SpaceDetailPage'))
const FloorPlanPage = lazy(() => import('@pages/spaces/FloorPlanPage'))
const BookingPage = lazy(() => import('@pages/spaces/BookingPage'))

// Admin pages
const AdminPage = lazy(() => import('@pages/admin/AdminPage'))
const UsersPage = lazy(() => import('@pages/admin/UsersPage'))
const SettingsPage = lazy(() => import('@pages/admin/SettingsPage'))
const ReportsPage = lazy(() => import('@pages/admin/ReportsPage'))

// Error pages
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'))

function App() {
  const { refreshUser, isAuthenticated, isLoading } = useAuthStore()

  // Initialize auth state on app load
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          {/* Public authentication routes */}
          <Route
            path="/auth/*"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthLayout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="login" element={<LoginPage />} />
                      <Route path="register" element={<RegisterPage />} />
                      <Route path="forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="reset-password" element={<ResetPasswordPage />} />
                      <Route path="verify-email" element={<VerifyEmailPage />} />
                      <Route path="*" element={<Navigate to="/auth/login" replace />} />
                    </Routes>
                  </Suspense>
                </AuthLayout>
              )
            }
          />

          {/* Protected application routes */}
          <Route
            path="/*"
            element={
              <AuthGuard>
                <AppLayout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      {/* Dashboard routes */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/dashboard/admin" element={<AdminDashboard />} />
                      <Route path="/dashboard/agent" element={<AgentDashboard />} />
                      <Route path="/dashboard/user" element={<UserDashboard />} />

                      {/* Ticket management routes */}
                      <Route path="/tickets" element={<TicketsPage />} />
                      <Route path="/tickets/new" element={<CreateTicketPage />} />
                      <Route path="/tickets/:id" element={<TicketDetailPage />} />

                      {/* Asset management routes */}
                      <Route path="/assets" element={<AssetsPage />} />
                      <Route path="/assets/new" element={<CreateAssetPage />} />
                      <Route path="/assets/:id" element={<AssetDetailPage />} />

                      {/* Space management routes */}
                      <Route path="/spaces" element={<SpacesPage />} />
                      <Route path="/spaces/booking" element={<BookingPage />} />
                      <Route path="/spaces/floor-plan" element={<FloorPlanPage />} />
                      <Route path="/spaces/:id" element={<SpaceDetailPage />} />

                      {/* Admin routes */}
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/admin/users" element={<UsersPage />} />
                      <Route path="/admin/settings" element={<SettingsPage />} />
                      <Route path="/admin/reports" element={<ReportsPage />} />

                      {/* Catch-all route for 404 */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </AppLayout>
              </AuthGuard>
            }
          />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}

export default App