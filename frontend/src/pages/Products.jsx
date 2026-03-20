import { useEffect, useState, useCallback } from "react";
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} from "../api";
import toast from "react-hot-toast";
import { Plus, Search, Pencil, Trash2, ArrowUpDown, Package } from "lucide-react";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

const EMPTY_FORM = {
  name: "",
  sku: "",
  description: "",
  category_id: "",
  category_name: "",
  price: "",
  quantity: "",
  low_stock_threshold: "10",
  unit: "pcs",
};

function StockBadge({ quantity, threshold }) {
  if (quantity === 0) return <span className="badge badge-red">Out of Stock</span>;
  if (quantity <= threshold) return <span className="badge badge-yellow">Low Stock</span>;
  return <span className="badge badge-green">In Stock</span>;
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [stockModal, setStockModal] = useState(null);
  const [stockChange, setStockChange] = useState("");
  const [stockMoveType, setStockMoveType] = useState("STOCK_IN");
  const [stockReason, setStockReason] = useState("");

  const fetchData = useCallback(() => {
    const params = {};
    if (search) params.search = search;
    if (filterCategory) params.category_id = filterCategory;
    return getProducts(params).then((r) => setProducts(r.data));
  }, [search, filterCategory]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchData(), getCategories().then((r) => setCategories(r.data))]).finally(() =>
      setLoading(false)
    );
  }, [fetchData]);

  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      sku: p.sku,
      description: p.description || "",
      category_id: p.category_id || "",
      category_name: p.category_name || "",
      price: String(p.price),
      quantity: String(p.quantity),
      low_stock_threshold: String(p.low_stock_threshold),
      unit: p.unit || "pcs",
    });
    setShowModal(true);
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const cat = categories.find((c) => c.id === catId);
    setForm((f) => ({ ...f, category_id: catId, category_name: cat ? cat.name : "" }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
      low_stock_threshold: parseInt(form.low_stock_threshold, 10),
    };
    try {
      if (editProduct) {
        await updateProduct(editProduct.id, payload);
        toast.success("Product updated!");
      } else {
        await createProduct(payload);
        toast.success("Product created!");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error saving product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success("Product deleted");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    const change = parseInt(stockChange, 10);
    if (isNaN(change) || change === 0) return toast.error("Enter a valid stock change");
    try {
      await updateStock(stockModal.id, {
        quantity_change: change,
        movement_type: stockMoveType,
        reason: stockReason || undefined,
      });
      toast.success("Stock updated!");
      setStockModal(null);
      setStockChange("");
      setStockReason("");
      setStockMoveType("STOCK_IN");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error updating stock");
    }
  };

  const formatCurrency = (v) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

  return (
    <div>
      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search by name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-input"
          style={{ width: "auto", minWidth: 160 }}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Products ({products.length})</h2>
        </div>
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /> Loading...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package size={40} />
            <h3>No products found</h3>
            <p>Add your first product to get started.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="product-name">{p.name}</div>
                      <div className="product-sku">{p.sku}</div>
                    </td>
                    <td>{p.category_name ? <span className="badge badge-blue">{p.category_name}</span> : "—"}</td>
                    <td>{formatCurrency(p.price)}</td>
                    <td>
                      <strong>{p.quantity}</strong> {p.unit}
                    </td>
                    <td>
                      <StockBadge quantity={p.quantity} threshold={p.low_stock_threshold} />
                    </td>
                    <td>
                      <div className="td-actions">
                        <button
                          className="btn-icon"
                          title="Update Stock"
                          onClick={() => { setStockModal(p); setStockChange(""); setStockReason(""); setStockMoveType("STOCK_IN"); }}
                        >
                          <ArrowUpDown size={15} />
                        </button>
                        <button className="btn-icon" title="Edit" onClick={() => openEdit(p)}>
                          <Pencil size={15} />
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Delete"
                          onClick={() => setDeleteTarget(p)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title={editProduct ? "Edit Product" : "Add Product"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editProduct ? "Save Changes" : "Create Product"}
              </button>
            </>
          }
        >
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  className="form-input"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">SKU *</label>
                <input
                  className="form-input"
                  required
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category_id} onChange={handleCategoryChange}>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select
                  className="form-input"
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                >
                  <option>pcs</option>
                  <option>kg</option>
                  <option>ltr</option>
                  <option>box</option>
                  <option>pack</option>
                  <option>set</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  required
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Low Stock Threshold</label>
              <input
                className="form-input"
                type="number"
                min="0"
                value={form.low_stock_threshold}
                onChange={(e) => setForm((f) => ({ ...f, low_stock_threshold: e.target.value }))}
              />
            </div>
          </form>
        </Modal>
      )}

      {stockModal && (
        <Modal
          title={`Update Stock — ${stockModal.name}`}
          onClose={() => setStockModal(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setStockModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleStockUpdate}>Update Stock</button>
            </>
          }
        >
          <p style={{ marginBottom: 16, color: "var(--gray-600)", fontSize: 14 }}>
            Current quantity: <strong>{stockModal.quantity} {stockModal.unit}</strong>
          </p>
          <div className="form-group">
            <label className="form-label">Movement Type</label>
            <select
              className="form-input"
              value={stockMoveType}
              onChange={(e) => setStockMoveType(e.target.value)}
            >
              <option value="STOCK_IN">STOCK_IN — Goods Receipt</option>
              <option value="STOCK_OUT">STOCK_OUT — Goods Issue</option>
              <option value="ADJUSTMENT">ADJUSTMENT — Manual Correction</option>
              <option value="RETURN">RETURN — Customer Return</option>
              <option value="TRANSFER">TRANSFER — Stock Transfer</option>
              <option value="DAMAGE">DAMAGE — Damaged / Scrapped</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">
              Quantity Change
              <span style={{ color: "var(--gray-400)", fontWeight: 400, marginLeft: 6 }}>
                (negative to reduce stock)
              </span>
            </label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 50 or -10"
              value={stockChange}
              onChange={(e) => setStockChange(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Reason / Reference</label>
            <input
              className="form-input"
              placeholder="e.g. PO-1023, Return from customer, Damaged in transit"
              value={stockReason}
              onChange={(e) => setStockReason(e.target.value)}
            />
          </div>
          {stockChange && !isNaN(parseInt(stockChange)) && (
            <div style={{
              background: "var(--gray-50)", border: "1px solid var(--gray-200)",
              borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--gray-600)"
            }}>
              New quantity: <strong>{stockModal.quantity + parseInt(stockChange)} {stockModal.unit}</strong>
              {" "}({parseInt(stockChange) > 0 ? "+" : ""}{stockChange})
            </div>
          )}
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Product?"
          message={`"${deleteTarget.name}" will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
