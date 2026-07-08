import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AdminOnly } from '@/app/admin-only'
import { LoginPage } from '@/features/auth/pages/login-page'
import { SignupPage } from '@/features/auth/pages/signup-page'
import { LandingPage } from '@/features/landing/pages/landing-page'
import { DashboardHomePage } from '@/features/dashboard/pages/dashboard-home-page'
import { ReportsPage } from '@/features/reports/pages/reports-page'
import { ReportDetailPage } from '@/features/reports/pages/report-detail-page'
import { RoomsPage } from '@/features/rooms/pages/rooms-page'
import { UsersPage } from '@/features/users/pages/users-page'
import { AnalyticsPage } from '@/features/analytics/pages/analytics-page'
import { AssetTransferPage } from '@/features/asset-transfers/pages/asset-transfer-page'
import { TransferRequestsPage } from '@/features/asset-transfers/pages/transfer-requests-page'
import { GuestRoute, ProtectedRoute } from './router-guards'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHomePage />} />
            <Route path="/dashboard/reports" element={<ReportsPage />} />
            <Route path="/dashboard/reports/:id" element={<ReportDetailPage />} />
            <Route path="/dashboard/rooms" element={<RoomsPage />} />
            <Route path="/dashboard/asset-transfers" element={<AssetTransferPage />} />
            <Route
              path="/dashboard/asset-transfers/review"
              element={<AdminOnly><TransferRequestsPage /></AdminOnly>}
            />
            <Route
              path="/dashboard/users"
              element={<AdminOnly><UsersPage /></AdminOnly>}
            />
            <Route
              path="/dashboard/analytics"
              element={<AdminOnly><AnalyticsPage /></AdminOnly>}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
