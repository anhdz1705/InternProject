import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

const icons = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  products: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12.1V21" /></>,
  stockIn: <><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M4 17v3h16v-3" /></>,
  stockOut: <><path d="M12 21V9m0 0 4 4m-4-4-4 4" /><path d="M4 7V4h16v3" /></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5m4-1v5l3 2" /></>,
  logout: <><path d="M10 17l5-5-5-5m5 5H3" /><path d="M14 4h6v16h-6" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
}

function Icon({ name }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  )
}

const navigation = [
  { to: '/dashboard', label: 'Tổng quan', icon: 'dashboard' },
  { to: '/products', label: 'Sản phẩm', icon: 'products' },
  { to: '/stock-in', label: 'Nhập kho', icon: 'stockIn' },
  { to: '/stock-out', label: 'Xuất kho', icon: 'stockOut' },
  { to: '/stock-history', label: 'Lịch sử kho', icon: 'history' },
]

function Sidebar() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    navigate('/login')
  }

  return (
    <>
      <button
        className="sidebar-toggle"
        type="button"
        aria-label="Mở menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Icon name="menu" />
        <span>Menu</span>
      </button>

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <Link className="sidebar__brand" to="/dashboard" onClick={() => setIsOpen(false)}>
          <span className="brand-mark">EZ</span>
          <span>EZ Inventory<small>Warehouse system</small></span>
        </Link>

        <div className="sidebar__section">
          <span className="sidebar__label">Quản lý kho</span>
          <nav className="sidebar__nav" aria-label="Điều hướng chính">
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setIsOpen(false)}>
                <Icon name={item.icon} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <span>WA</span>
            <div><strong>Warehouse Admin</strong><small>Đang hoạt động</small></div>
          </div>
          <button type="button" onClick={handleLogout}>
            <Icon name="logout" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {isOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Đóng menu"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar
