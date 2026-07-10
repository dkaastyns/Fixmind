import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AdminOnly } from '@/app/admin-only'
import React, { Suspense } from 'react'
import { PageTransition, PageTransitionSkeleton } from '@/components/ui/page-transition'
import { GuestRoute, ProtectedRoute } from './router-guards'

const LoginPage = React.lazy(() => import('@/features/auth/pages/login-page').then(m => ({ default: m.LoginPage })))
const SignupPage = React.lazy(() => import('@/features/auth/pages/signup-page').then(m => ({ default: m.SignupPage })))
const LandingPage = React.lazy(() => import('@/features/landing/pages/landing-page').then(m => ({ default: m.LandingPage })))
const TermsPage = React.lazy(() => import('@/features/landing/pages/terms-page').then(m => ({ default: m.TermsPage })))
const DashboardHomePage = React.lazy(() => import('@/features/dashboard/pages/dashboard-home-page').then(m => ({ default: m.DashboardHomePage })))
const ReportsPage = React.lazy(() => import('@/features/reports/pages/reports-page').then(m => ({ default: m.ReportsPage })))
const ReportDetailPage = React.lazy(() => import('@/features/reports/pages/report-detail-page').then(m => ({ default: m.ReportDetailPage })))
const RoomsPage = React.lazy(() => import('@/features/rooms/pages/rooms-page').then(m => ({ default: m.RoomsPage })))
const UsersPage = React.lazy(() => import('@/features/users/pages/users-page').then(m => ({ default: m.UsersPage })))

const AssetTransferPage = React.lazy(() => import('@/features/asset-transfers/pages/asset-transfer-page').then(m => ({ default: m.AssetTransferPage })))
const TransferRequestsPage = React.lazy(() => import('@/features/asset-transfers/pages/transfer-requests-page').then(m => ({ default: m.TransferRequestsPage })))
const ProfilePage = React.lazy(() => import('@/features/profile/pages/profile-page').then(m => ({ default: m.ProfilePage })))
const MaintenancePage = React.lazy(() => import('@/features/maintenance/pages/maintenance-page').then(m => ({ default: m.MaintenancePage })))

const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageTransitionSkeleton />}>
    <PageTransition>
      {children}
    </PageTransition>
  </Suspense>
)

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LazyPage><LandingPage /></LazyPage>} />
        <Route path="/terms" element={<LazyPage><TermsPage /></LazyPage>} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LazyPage><LoginPage /></LazyPage>} />
          <Route path="/signup" element={<LazyPage><SignupPage /></LazyPage>} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<LazyPage><DashboardHomePage /></LazyPage>} />
            <Route path="/dashboard/reports" element={<LazyPage><ReportsPage /></LazyPage>} />
            <Route path="/dashboard/reports/:id" element={<LazyPage><ReportDetailPage /></LazyPage>} />
            <Route path="/dashboard/rooms" element={<LazyPage><RoomsPage /></LazyPage>} />
            <Route path="/dashboard/asset-transfers" element={<LazyPage><AssetTransferPage /></LazyPage>} />
            <Route path="/dashboard/profile" element={<LazyPage><ProfilePage /></LazyPage>} />
            <Route
              path="/dashboard/asset-transfers/review"
              element={<AdminOnly><LazyPage><TransferRequestsPage /></LazyPage></AdminOnly>}
            />
            <Route
              path="/dashboard/users"
              element={<AdminOnly><LazyPage><UsersPage /></LazyPage></AdminOnly>}
            />
            <Route
              path="/dashboard/maintenance"
              element={<AdminOnly><LazyPage><MaintenancePage /></LazyPage></AdminOnly>}
            />

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
