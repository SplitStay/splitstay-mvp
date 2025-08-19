import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ChatService } from './lib/chatService'
import { useEffect } from 'react'
import { HomePage, LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage, DashboardPage, TermsPage, PrivacyPage, HowItWorks, FindPartnerPage } from './pages'
import PostTripPage from './pages/PostTripPage'
import CreateProfilePage from './pages/CreateProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import ProfilePage from './pages/ProfilePage'
import { MessagesPage } from './pages/MessagesPage'
import { TripDetailPage } from './pages/TripDetailPage'
import { motion } from 'framer-motion'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

// Public Route Component (redirect to home if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return !user ? <>{children}</> : <Navigate to="/dashboard" replace />
}

// Private Route Component (redirect to login if not authenticated)
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()

  useEffect(() => {
    if (user?.id) {
      ChatService.updateUserPresence(true)
      
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          ChatService.updateUserPresence(true)
        } else {
          ChatService.updateUserPresence(false)
        }
      }
      
      const handleBeforeUnload = () => {
        ChatService.updateUserPresence(false)
      }
      
      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('beforeunload', handleBeforeUnload)
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('beforeunload', handleBeforeUnload)
        ChatService.updateUserPresence(false)
      }
    }
  }, [user?.id])

  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <HomePage />
        </PublicRoute>
      } />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        } 
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/create-profile" 
        element={
          <PrivateRoute>
            <CreateProfilePage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/edit-profile" 
        element={
          <PrivateRoute>
            <EditProfilePage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/profile/:id" 
        element={<ProfilePage />} 
      />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route
        path="/post-trip"
        element={
          <PrivateRoute>
            <PostTripPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/find-partners"
        element={
          <PrivateRoute>
            <FindPartnerPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <PrivateRoute>
            <MessagesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/trip/:id"
        element={
          <PrivateRoute>
            <TripDetailPage />
          </PrivateRoute>
        }
      />
      
      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App;