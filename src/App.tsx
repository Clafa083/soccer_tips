import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './features/home/HomePage'
import { MatchesPage } from './features/matches/MatchesPage'
import { BettingPage } from './features/betting/BettingPage'
import { LeaderboardPage } from './features/leaderboard/LeaderboardPage'
import { ForumPage } from './features/forum/ForumPage'
import { ForumPostDetailPage } from './features/forum/ForumPostDetailPage'
import { ProfilePage } from './features/profile/ProfilePage'
import { AdminPage } from './features/admin/AdminPage'
import { UserDetailsPage } from './features/admin/UserDetailsPage'
import { MatchDetailsPage } from './features/matches/MatchDetailsPage'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './features/auth/ResetPasswordPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppThemeProvider } from './context/ThemeContext'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'

function App() {
  return (
    <AppThemeProvider>
      <BrowserRouter basename="/eankbt">
      <Routes>
        <Route path="/" element={<MainLayout />}>          <Route index element={<HomePage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="match/:matchId" element={<MatchDetailsPage />} />          <Route path="betting" element={
            <ProtectedRoute>
              <BettingPage />
            </ProtectedRoute>
          } />
          <Route path="betting/:userId" element={
            <ProtectedRoute requireAdmin>
              <BettingPage />
            </ProtectedRoute>
          } />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="user/:userId" element={<UserDetailsPage />} />
          <Route path="forum" element={<ForumPage />} />          <Route path="forum/:id" element={<ForumPostDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} /><Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="admin/*" element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          } />          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
      <PWAInstallPrompt />
    </AppThemeProvider>
  )
}

export default App
