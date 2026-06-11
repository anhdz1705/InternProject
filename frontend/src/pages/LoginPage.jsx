import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/authApi'

const authIcons = {
  user: (
    <>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 15v2" />
    </>
  ),
}

function AuthIcon({ name }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {authIcons[name]}
    </svg>
  )
}

function AuthInput({ icon, label, ...props }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <span className="auth-input-shell">
        <span className="auth-input-icon">
          <AuthIcon name={icon} />
        </span>
        <input {...props} />
      </span>
    </label>
  )
}

function SmartWarehouseIllustration() {
  return (
    <div className="warehouse-illustration" aria-hidden="true">
      <svg viewBox="0 0 720 620" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="floorGradient" x1="122" y1="426" x2="614" y2="570" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EAF3EE" />
            <stop offset="0.55" stopColor="#F8FBF8" />
            <stop offset="1" stopColor="#DDEBE7" />
          </linearGradient>
          <linearGradient id="greenFace" x1="250" y1="210" x2="486" y2="438" gradientUnits="userSpaceOnUse">
            <stop stopColor="#13A77D" />
            <stop offset="1" stopColor="#075F49" />
          </linearGradient>
          <linearGradient id="blueGlow" x1="254" y1="138" x2="546" y2="324" gradientUnits="userSpaceOnUse">
            <stop stopColor="#83D9FF" />
            <stop offset="1" stopColor="#2463EB" />
          </linearGradient>
          <linearGradient id="boxGold" x1="178" y1="252" x2="350" y2="420" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD994" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="rackSteel" x1="88" y1="136" x2="228" y2="424" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ECF4F1" />
            <stop offset="1" stopColor="#9AA9A3" />
          </linearGradient>
          <filter id="softShadow" x="52" y="108" width="616" height="480" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="24" stdDeviation="22" floodColor="#10231D" floodOpacity="0.14" />
          </filter>
          <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="warehouse-float">
          <g className="ambient-data-field">
            <path className="ambient-line ambient-line-a" d="M64 96 662 470" />
            <path className="ambient-line ambient-line-b" d="M156 548 636 302" />
            <path className="ambient-line ambient-line-c" d="M88 426 232 72" />
            <path className="ambient-line ambient-line-d" d="M506 76 420 318" />
          </g>

          <path className="warehouse-floor" d="M104 444 372 318 626 444 360 572 104 444Z" fill="url(#floorGradient)" />
          <path className="floor-grid-line" d="m164 444 222-104M232 479l222-104M302 515l222-104M262 369l256 126M196 400l256 126" />

          <g className="warehouse-rack warehouse-rack-left" filter="url(#softShadow)">
            <path d="M124 172 250 118l112 58-128 58-110-62Z" fill="#F7FAF8" />
            <path d="M124 172v206l110 66V234l-110-62Z" fill="url(#rackSteel)" />
            <path d="M234 234v210l128-68V176l-128 58Z" fill="#DCE7E2" />
            <path d="M144 207 234 258l105-52M144 273l90 51 105-52M144 340l90 51 105-52" stroke="#6D7D76" strokeWidth="5" strokeLinecap="round" />
            <path d="M124 172v206M234 234v210M362 176v200" stroke="#52635D" strokeWidth="8" strokeLinecap="round" />
            <g className="floating-box floating-box-orange">
              <path d="m162 238 42-19 42 24-42 20-42-25Z" fill="#D97706" />
              <path d="m204 263 42-20v48l-42 22v-50Z" fill="#B45309" />
              <path d="m162 238 42 25v50l-42-26v-49Z" fill="#F59E0B" />
            </g>
            <g className="floating-box floating-box-green">
              <path d="m171 314 42-19 42 24-42 20-42-25Z" fill="#19B987" />
              <path d="m213 339 42-20v46l-42 22v-48Z" fill="#087F5B" />
              <path d="m171 314 42 25v48l-42-26v-47Z" fill="#34D399" />
              <path className="box-scan" d="M194 353 232 332" />
            </g>
          </g>

          <g className="central-hub" filter="url(#softShadow)">
            <path d="M278 244 392 186l116 62-116 64-114-68Z" fill="#F7FFFB" />
            <path d="M278 244v156l114 72V312l-114-68Z" fill="url(#greenFace)" />
            <path d="M392 312v160l116-70V248l-116 64Z" fill="#0B6F57" />
            <path d="m278 244 114 68 116-64" stroke="#CFF9EA" strokeWidth="4" strokeLinecap="round" />
            <path className="hub-glow" d="M328 255 392 223l67 36-67 37-64-41Z" fill="url(#blueGlow)" />
            <path className="hub-door hub-door-left" d="M315 306 358 331v52l-43-26v-51Z" fill="#DFF8ED" opacity="0.92" />
            <path className="hub-door hub-door-right" d="m426 338 48-28v52l-48 30v-54Z" fill="#A7F3D0" opacity="0.75" />
            <path d="M315 306 358 331l45-25M426 338l48-28" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />
            <path className="hub-scan-line hub-scan-line-a" d="m316 355 44 26" />
            <path className="hub-scan-line hub-scan-line-b" d="m426 373 48-29" />
          </g>

          <g className="warehouse-rack warehouse-rack-right" filter="url(#softShadow)">
            <path d="M452 182 560 134l86 46-110 52-84-50Z" fill="#F6FAFA" />
            <path d="M452 182v170l84 52V232l-84-50Z" fill="#D9E5E3" />
            <path d="M536 232v172l110-58V180l-110 52Z" fill="#C8D5D2" />
            <path d="M470 226 536 266l92-44M470 286l66 40 92-44" stroke="#62736D" strokeWidth="5" strokeLinecap="round" />
            <path d="M452 182v170M536 232v172M646 180v166" stroke="#52635D" strokeWidth="7" strokeLinecap="round" />
            <g className="floating-box floating-box-blue">
              <path d="m488 252 36-17 34 20-36 18-34-21Z" fill="#93C5FD" />
              <path d="m522 273 36-18v42l-36 19v-43Z" fill="#2563EB" />
              <path d="m488 252 34 21v43l-34-22v-42Z" fill="#60A5FA" />
            </g>
          </g>

          <g className="data-network" filter="url(#lineGlow)">
            <path className="data-line data-line-a" d="M180 186 C236 92 346 86 392 186" />
            <path className="data-line data-line-b" d="M392 224 C468 126 566 122 611 183" />
            <path className="data-line data-line-c" d="M220 356 C306 288 427 288 555 337" />
            <path className="data-line data-line-d" d="M332 246 C348 172 444 160 480 220" />
            <path className="data-line data-line-e" d="M196 350 C268 410 418 414 632 356" />
            <path className="data-line data-line-f" d="M226 152 C266 210 314 232 392 223" />
            <circle className="data-node node-a" cx="180" cy="186" r="7" />
            <circle className="data-node node-b" cx="392" cy="186" r="8" />
            <circle className="data-node node-c" cx="611" cy="183" r="7" />
            <circle className="data-node node-d" cx="555" cy="337" r="7" />
            <circle className="data-node node-e" cx="632" cy="356" r="7" />
            <circle className="data-particle particle-a" cx="212" cy="151" r="5" />
            <circle className="data-particle particle-b" cx="451" cy="159" r="4" />
            <circle className="data-particle particle-c" cx="288" cy="323" r="4" />
            <circle className="data-particle particle-d" cx="240" cy="368" r="4" />
            <circle className="data-particle particle-e" cx="246" cy="164" r="4" />
          </g>

          <g className="status-panels">
            <path className="info-card-surface" d="M502 80h104c13 0 24 11 24 24v54c0 13-11 24-24 24H502c-13 0-24-11-24-24v-54c0-13 11-24 24-24Z" fill="#FFFFFF" fillOpacity="0.82" stroke="#D9E7E1" />
            <path d="M500 111h52M500 134h84" stroke="#087F5B" strokeWidth="8" strokeLinecap="round" />
            <path className="panel-scan" d="M500 158h108" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setError('')
    setNotice('')
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
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

  const handleForgotPassword = () => {
    setError('')
    setNotice('Vui lòng liên hệ quản trị viên để đặt lại mật khẩu.')
  }

  const handleCreateAccount = (event) => {
    event?.preventDefault()
    setError('')
    setNotice('Tài khoản mới cần được quản trị viên phê duyệt trước khi sử dụng.')
  }

  return (
    <main className="auth-page">
      <section className="auth-visual-panel" aria-label="Minh họa trung tâm logistics thông minh">
        <SmartWarehouseIllustration />
      </section>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-heading">
          <h2>Đăng nhập</h2>
          <p>Dùng tài khoản quản trị để truy cập dữ liệu kho.</p>
        </div>

        <div className="auth-fields">
          <AuthInput
            icon="user"
            label="Tên đăng nhập"
            name="username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            placeholder="Nhập tên đăng nhập"
            required
          />

          <AuthInput
            icon="lock"
            label="Mật khẩu"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            required
          />
        </div>

        {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}
        {notice && <p className="auth-message auth-message--notice" role="status">{notice}</p>}

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <div className="auth-secondary-actions">
          <button className="auth-text-action" type="button" onClick={handleForgotPassword}>
            Quên mật khẩu?
          </button>
        </div>

        <p className="auth-create">
          Chưa có tài khoản?{' '}
          <a className="auth-create-link" href="#create-account" onClick={handleCreateAccount}>
            Tạo tài khoản mới
          </a>
        </p>
      </form>
    </main>
  )
}

export default LoginPage
