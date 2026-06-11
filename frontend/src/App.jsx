import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import ProductFormPage from './pages/ProductFormPage'
import ProductListPage from './pages/ProductListPage'
import StockDocumentFormPage from './pages/StockDocumentFormPage'
import StockHistoryDetailPage from './pages/StockHistoryDetailPage'
import StockHistoryPage from './pages/StockHistoryPage'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('accessToken')

  return token ? children : <Navigate to="/login" replace />
}

function AppLayout() {
  return (
    <ProtectedRoute>
      <div className="app-layout">
        <Sidebar />
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/new" element={<ProductFormPage />} />
        <Route path="/products/:id/edit" element={<ProductFormPage />} />
        <Route path="/stock-in" element={<StockDocumentFormPage transactionType="IN" />} />
        <Route path="/stock-out" element={<StockDocumentFormPage transactionType="OUT" />} />
        <Route path="/stock-history" element={<StockHistoryPage />} />
        <Route path="/stock-history/:id" element={<StockHistoryDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
