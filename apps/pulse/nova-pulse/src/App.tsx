import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './contexts/ThemeContext'
import { Layout } from './components/layout'
import { DashboardPage } from './pages/DashboardPage'
import { TicketsPage } from './pages/TicketsPage'
import { DeepWorkPage } from './pages/DeepWorkPage'
import { GamificationPage } from './pages/GamificationPage'
import AlertsPage from './pages/AlertsPage'
import SentinelDashboard from './components/monitoring/SentinelDashboard'
import GoAlertDashboard from './components/goalert/GoAlertDashboard'
import { InventoryPage } from './pages/InventoryPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
// Enhanced ticket management components
import { EnhancedTicketGrid } from './components/enhanced/EnhancedTicketGrid'
import { EnhancedDeepWorkPage } from './components/enhanced/EnhancedDeepWorkPage'
import { EnhancedDashboard } from './components/enhanced/EnhancedDashboard'
import { SmartQueueManagement } from './components/enhanced/SmartQueueManagement'
import CommunicationHubPage from './pages/CommunicationHubPage'
import AdvancedSearchPage from './pages/AdvancedSearchPage'
import PerformanceAnalyticsPage from './pages/PerformanceAnalyticsPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } }
})

// Mock current user - in production this would come from authentication context
const mockCurrentUser = {
  id: 'current-user',
  username: 'currentuser',
  email: 'user@company.com',
  role: 'agent' as const,
  firstName: 'Current',
  lastName: 'User',
  isActive: true,
  isVip: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const App: React.FC = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            {/* Enhanced dashboard with role-based views */}
            <Route path="/" element={<EnhancedDashboard user={mockCurrentUser} />} />
            
            {/* Enhanced ticket management */}
            <Route path="/tickets" element={<EnhancedTicketGrid />} />
            <Route path="/tickets/:ticketId" element={<EnhancedDeepWorkPage />} />
            
            {/* Deep Work Mode - standalone */}
            <Route path="/deepwork" element={<EnhancedDeepWorkPage />} />
            
            {/* Smart Queue Management */}
            <Route path="/queue" element={<SmartQueueManagement />} />
            
            {/* Communication Hub */}
            <Route path="/communication" element={<CommunicationHubPage />} />
            
            {/* Advanced Search & Navigation */}
            <Route path="/search" element={<AdvancedSearchPage />} />
            
            {/* Performance Analytics */}
            <Route path="/analytics" element={<PerformanceAnalyticsPage />} />
            
            {/* Legacy pages for gradual migration */}
            <Route path="/legacy/dashboard" element={<DashboardPage />} />
            <Route path="/legacy/tickets" element={<TicketsPage />} />
            <Route path="/legacy/deep-work" element={<DeepWorkPage />} />
            
            {/* Other existing pages */}
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/monitoring" element={<SentinelDashboard />} />
            <Route path="/goalert" element={<GoAlertDashboard />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/gamification" element={<GamificationPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  </ThemeProvider>
)

export default App
