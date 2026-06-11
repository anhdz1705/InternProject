import { Link, NavLink, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const isLoggedIn = Boolean(localStorage.getItem('accessToken'))

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    navigate('/login')
  }

  return (
    <header className="navbar">
      <Link className="navbar__brand" to="/dashboard">
        <span className="brand-mark">EZ</span>
        <span>
          EZ Inventory
          <small>Bảng điều khiển kho</small>
        </span>
      </Link>

      <nav className="navbar__links" aria-label="Điều hướng chính">
        {isLoggedIn && (
          <>
            <NavLink to="/dashboard">Tổng quan</NavLink>
            <NavLink to="/products">Sản phẩm</NavLink>
            <button type="button" onClick={handleLogout}>
              Đăng xuất
            </button>
          </>
        )}
      </nav>
    </header>
  )
}

export default Navbar
