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
      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="auth-heading">
          <span className="eyebrow">Quản lý kho</span>
          <h1>Đăng nhập</h1>
          <p>Quản lý sản phẩm, tồn kho, nhà cung cấp và danh mục.</p>
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
