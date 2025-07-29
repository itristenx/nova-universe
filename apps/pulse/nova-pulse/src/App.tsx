import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardPage } from './pages/DashboardPage'
import { TicketsPage } from './pages/TicketsPage'
import { DeepWorkPage } from './pages/DeepWorkPage'
import { GamificationPage } from './pages/GamificationPage'
import { AlertsPage } from './pages/AlertsPage'
import { InventoryPage } from './pages/InventoryPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { MailroomIntakePage } from './pages/MailroomIntakePage'
import { DeliveryTrackingPage } from './pages/DeliveryTrackingPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } }
})

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/tickets/:ticketId" element={<DeepWorkPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/mailroom/intake" element={<MailroomIntakePage />} />
        <Route path="/mailroom/tracking" element={<DeliveryTrackingPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/gamification" element={<GamificationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </QueryClientProvider>
)

export default App
