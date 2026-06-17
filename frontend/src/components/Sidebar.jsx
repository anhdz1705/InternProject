import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

const icons = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  reports: <><path d="M4 19V5" /><path d="M4 19h16" /><rect x="7" y="11" width="3" height="5" rx="1" /><rect x="12" y="8" width="3" height="8" rx="1" /><rect x="17" y="5" width="3" height="11" rx="1" /></>,
  products: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12.1V21" /></>,
  stockIn: <><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M4 17v3h16v-3" /></>,
  stockOut: <><path d="M12 21V9m0 0 4 4m-4-4-4 4" /><path d="M4 7V4h16v3" /></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5m4-1v5l3 2" /></>,
  logout: <><path d="M10 17l5-5-5-5m5 5H3" /><path d="M14 4h6v16h-6" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  shield: <><path d="M12 3 5 6v5c0 4.3 2.9 8.3 7 10 4.1-1.7 7-5.7 7-10V6l-7-3Z" /><path d="M12 8v5" /><path d="M12 17h.01" /></>,
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
  { to: '/reports', label: 'Báo cáo', icon: 'reports' },
  { to: '/products', label: 'Sản phẩm', icon: 'products' },
  { to: '/stock-in', label: 'Nhập kho', icon: 'stockIn' },
  { to: '/stock-out', label: 'Xuất kho', icon: 'stockOut' },
  { to: '/stock-history', label: 'Lịch sử kho', icon: 'history' },
]

function Sidebar() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)

  useEffect(() => {
    if (!isLogoutConfirmOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsLogoutConfirmOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLogoutConfirmOpen])

  const requestLogout = () => {
    setIsOpen(false)
    setIsLogoutConfirmOpen(true)
  }

  const confirmLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setIsLogoutConfirmOpen(false)
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
          <span>EZ Inventory<small>Quản lý kho tinh gọn</small></span>
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
            <span>QTV</span>
            <div><strong>Quản trị viên</strong><small>Đang hoạt động</small></div>
          </div>
          <button type="button" onClick={requestLogout}>
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

      {isLogoutConfirmOpen && (
        <div className="logout-confirm" role="presentation" onMouseDown={() => setIsLogoutConfirmOpen(false)}>
          <section
            className="logout-confirm__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-confirm-title"
            aria-describedby="logout-confirm-description"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="logout-confirm__icon">
              <Icon name="shield" />
            </span>
            <div className="logout-confirm__copy">
              <h2 id="logout-confirm-title">Xác nhận đăng xuất</h2>
              <p id="logout-confirm-description">
                Bạn sẽ rời khỏi phiên làm việc hiện tại và cần đăng nhập lại để tiếp tục quản lý kho.
              </p>
            </div>
            <div className="logout-confirm__actions">
              <button className="logout-confirm__cancel" type="button" onClick={() => setIsLogoutConfirmOpen(false)} autoFocus>
                Hủy
              </button>
              <button className="logout-confirm__confirm" type="button" onClick={confirmLogout}>
                Đăng xuất
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default Sidebar
