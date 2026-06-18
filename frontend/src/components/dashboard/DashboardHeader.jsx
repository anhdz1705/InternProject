import { Link } from 'react-router-dom'

function DashboardHeader() {
  return (
    <div className="dashboard-hero">
      <div>
        <h1>Tổng quan kho EZ Inventory</h1>
        <p>Theo dõi tồn kho, cảnh báo bổ sung và xuất nhập hàng.</p>
      </div>

      <div className="dashboard-hero__actions">
        <Link className="dashboard-action dashboard-action--secondary" to="/stock-out">
          <span aria-hidden="true">↗</span>
          Xuất kho
        </Link>
        <Link className="dashboard-action" to="/stock-in">
          <span aria-hidden="true">+</span>
          Nhập kho
        </Link>
      </div>
    </div>
  )
}

export default DashboardHeader
