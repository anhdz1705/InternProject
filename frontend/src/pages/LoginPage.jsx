import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/authApi'

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await login(form.username, form.password)
      localStorage.setItem('accessToken', data.access)
      localStorage.setItem('refreshToken', data.refresh)
      navigate('/dashboard')
    } catch {
      setError('Tên đăng nhập hoặc mật khẩu không đúng.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro" aria-label="Giới thiệu hệ thống">
        <span className="eyebrow">EZ Inventory</span>
        <h1>Kiểm soát kho hàng trong một màn hình rõ ràng.</h1>
        <p>Quản lý sản phẩm, tồn kho, nhà cung cấp và danh mục bằng giao diện gọn cho ca vận hành hằng ngày.</p>
        <div className="auth-proof">
          <span>REST API</span>
          <span>JWT</span>
          <span>PostgreSQL</span>
        </div>
      </section>

      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="auth-heading">
          <span className="eyebrow">Đăng nhập</span>
          <h2>Vào bảng điều khiển</h2>
          <p>Dùng tài khoản quản trị để truy cập dữ liệu kho.</p>
        </div>

        <label>
          Tên đăng nhập
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Mật khẩu
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </main>
  )
}

export default LoginPage
