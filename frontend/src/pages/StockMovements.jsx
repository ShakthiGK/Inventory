import { useEffect, useState, useCallback } from "react";
import { getMovements, getProducts } from "../api";
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, Search } from "lucide-react";

const MOVEMENT_META = {
  STOCK_IN:    { label: "Stock In",    badgeClass: "badge-green",  icon: <ArrowDownCircle size={13}/> },
  STOCK_OUT:   { label: "Stock Out",   badgeClass: "badge-red",    icon: <ArrowUpCircle size={13}/> },
  ADJUSTMENT:  { label: "Adjustment",  badgeClass: "badge-blue",   icon: <RefreshCw size={13}/> },
  RETURN:      { label: "Return",      badgeClass: "badge-yellow", icon: <ArrowDownCircle size={13}/> },
  TRANSFER:    { label: "Transfer",    badgeClass: "badge-gray",   icon: <RefreshCw size={13}/> },
  DAMAGE:      { label: "Damage",      badgeClass: "badge-red",    icon: <ArrowUpCircle size={13}/> },
  INITIAL:     { label: "Initial",     badgeClass: "badge-blue",   icon: <ArrowDownCircle size={13}/> },
};

function MovementBadge({ type }) {
  const meta = MOVEMENT_META[type] || { label: type, badgeClass: "badge-gray", icon: null };
  return (
    <span className={`badge ${meta.badgeClass}`}>
      {meta.icon} {meta.label}
    </span>
  );
}

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProduct, setFilterProduct] = useState("");
  const [filterType, setFilterType] = useState("");

  const fetchMovements = useCallback(() => {
    const params = {};
    if (filterProduct) params.product_id = filterProduct;
    if (filterType) params.movement_type = filterType;
    return getMovements(params).then((r) => setMovements(r.data));
  }, [filterProduct, filterType]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMovements(), getProducts().then((r) => setProducts(r.data))])
      .finally(() => setLoading(false));
  }, [fetchMovements]);

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div>
      <div className="toolbar">
        <select
          className="form-input"
          style={{ width: "auto", minWidth: 200 }}
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
        >
          <option value="">All Products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
          ))}
        </select>
        <select
          className="form-input"
          style={{ width: "auto", minWidth: 170 }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Movement Types</option>
          {Object.entries(MOVEMENT_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Stock Movement History ({movements.length})</h2>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /> Loading...</div>
        ) : movements.length === 0 ? (
          <div className="empty-state">
            <Search size={40} />
            <h3>No movements found</h3>
            <p>Stock movements will appear here after any stock update.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Type</th>
                  <th>Change</th>
                  <th>Before</th>
                  <th>After</th>
                  <th>Reason / Reference</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td style={{ color: "var(--gray-500)", whiteSpace: "nowrap", fontSize: 13 }}>
                      {formatDate(m.timestamp)}
                    </td>
                    <td><div className="product-name">{m.product_name}</div></td>
                    <td><span className="badge badge-gray">{m.sku}</span></td>
                    <td><MovementBadge type={m.movement_type} /></td>
                    <td>
                      <strong style={{
                        color: m.quantity_change > 0 ? "var(--success)" : "var(--danger)"
                      }}>
                        {m.quantity_change > 0 ? "+" : ""}{m.quantity_change}
                      </strong>
                    </td>
                    <td style={{ color: "var(--gray-500)" }}>{m.quantity_before}</td>
                    <td><strong>{m.quantity_after}</strong></td>
                    <td style={{ color: "var(--gray-500)", fontSize: 13 }}>
                      {m.reason || "—"}
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>
                        <div style={{ fontWeight: 500 }}>{m.user_name || "—"}</div>
                        <div style={{ color: "var(--gray-400)", fontSize: 11 }}>{m.user_email}</div>
                      </div>
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
