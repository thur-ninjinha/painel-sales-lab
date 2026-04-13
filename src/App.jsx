import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { AppLayout } from './components/layout/AppLayout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Caixa } from './pages/Caixa'
import { Metas } from './pages/Metas'
import { Trafego } from './pages/Trafego'
import { Leads } from './pages/Leads'
import { Loader2 } from 'lucide-react'

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-bg">
      <Loader2 size={28} className="text-brand animate-spin" />
    </div>
  )
  if (!session) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="caixa" element={<Caixa />} />
        <Route path="metas" element={<Metas />} />
        <Route path="trafego" element={<Trafego />} />
        <Route path="leads" element={<Leads />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
