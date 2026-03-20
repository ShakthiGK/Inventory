import { useEffect, useState } from "react";
import { getDashboardStats, getProducts } from "../api";
import { Package, Tag, AlertTriangle, XCircle, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function StockBadge({ quantity, threshold }) {
  if (quantity === 0) return <span className="badge badge-red">Out of Stock</span>;
  if (quantity <= threshold) return <span className="badge badge-yellow">Low Stock</span>;
  return <span className="badge badge-green">In Stock</span>;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getProducts({ low_stock: true })])
      .then(([statsRes, productsRes]) => {
        setStats(statsRes.data);
        setLowStockProducts(productsRes.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-wrap">
        <div className="spinner" />
        Loading dashboard...
      </div>
    );
  }

  const formatCurrency = (v) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

  return (
    <div>
      <div className="stats-grid">
        <StatCard
          icon={<Package size={24} />}
          label="Total Products"
          value={stats.total_products}
          color="blue"
        />
        <StatCard
          icon={<Tag size={24} />}
          label="Categories"
          value={stats.total_categories}
          color="green"
        />
        <StatCard
          icon={<AlertTriangle size={24} />}
          label="Low Stock Items"
          value={stats.low_stock_count}
          color="yellow"
        />
        <StatCard
          icon={<XCircle size={24} />}
          label="Out of Stock"
          value={stats.out_of_stock_count}
          color="red"
        />
        <StatCard
          icon={<DollarSign size={24} />}
          label="Total Inventory Value"
          value={formatCurrency(stats.total_inventory_value)}
          color="blue"
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Low Stock Alerts</h2>
          <Link to="/products" className="btn btn-secondary btn-sm">View All Products</Link>
        </div>
        {lowStockProducts.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle size={36} />
            <h3>All stocked up!</h3>
            <p>No products are low on stock right now.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Threshold</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="product-name">{p.name}</div>
                    </td>
                    <td><span className="badge badge-gray">{p.sku}</span></td>
                    <td>{p.category_name || "—"}</td>
                    <td><strong>{p.quantity} {p.unit}</strong></td>
                    <td>{p.low_stock_threshold}</td>
                    <td>
                      <StockBadge quantity={p.quantity} threshold={p.low_stock_threshold} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
