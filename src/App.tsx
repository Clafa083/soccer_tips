import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './features/home/HomePage'
import { MatchesPage } from './features/matches/MatchesPage'
import { BettingPage } from './features/betting/BettingPage'
import { LeaderboardPage } from './features/leaderboard/LeaderboardPage'
import ForumPage from './features/forum/ForumPage'
import { AdminPage } from './features/admin/AdminPage'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

function App() {
  return (
    <BrowserRouter basename="/vm2026">
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="betting" element={
            <ProtectedRoute>
              <BettingPage />
            </ProtectedRoute>
          } />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="forum" element={<ForumPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="profile" element={
            <ProtectedRoute>
              <div>Profile coming soon</div>
            </ProtectedRoute>
          } />
          <Route path="admin/*" element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
