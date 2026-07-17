import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext"
import { AppLayout } from "@/components/layout/AppLayout"
import Login from "@/pages/Login"
import Dashboard from "@/pages/Dashboard"
import Products from "@/pages/Products"
import Orders from "@/pages/Orders"
import Users from "@/pages/Users"
import Data from "@/pages/Data"
import { useEffect } from "react"
import type { ReactNode } from "react"
import { usePwaInstall } from "@/hooks/usePwaInstall"

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Users />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/data"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Data />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function ToastWithTheme() {
  const { theme } = useTheme()
  const { canInstall, showInstallToast } = usePwaInstall()

  useEffect(() => {
    if (!canInstall) return
    const timer = setTimeout(showInstallToast, 10000)
    return () => clearTimeout(timer)
  }, [canInstall, showInstallToast])

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
    />
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/erp-dashboard">
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <ToastWithTheme />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
