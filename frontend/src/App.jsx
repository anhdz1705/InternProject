import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import ProductFormPage from './pages/ProductFormPage'
import ProductListPage from './pages/ProductListPage'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('accessToken')

  return token ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/new"
          element={
            <ProtectedRoute>
              <ProductFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute>
              <ProductFormPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
