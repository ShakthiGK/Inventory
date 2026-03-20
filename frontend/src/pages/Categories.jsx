import { useEffect, useState } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../api";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", code: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = () =>
    getCategories().then((r) => setCategories(r.data));

  useEffect(() => {
    setLoading(true);
    fetchCategories().finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditCat(null);
    setForm({ name: "", description: "", code: "" });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({ name: cat.name, description: cat.description || "", code: cat.code || "" });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editCat) {
        await updateCategory(editCat.id, form);
        toast.success("Category updated!");
      } else {
        await createCategory(form);
        toast.success("Category created!");
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error saving category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success("Category deleted");
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div>
      <div className="toolbar" style={{ justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Categories ({categories.length})</h2>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /> Loading...</div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <Tag size={40} />
            <h3>No categories yet</h3>
            <p>Create your first category to organize products.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name / SAP Code</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: "var(--primary-light)", color: "var(--primary)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <Tag size={14} />
                        </div>
                        <div>
                          <strong>{cat.name}</strong>
                          {cat.code && (
                            <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>
                              SAP MTART: {cat.code}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--gray-500)" }}>{cat.description || "—"}</td>
                    <td style={{ color: "var(--gray-500)" }}>{formatDate(cat.created_at)}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn-icon" title="Edit" onClick={() => openEdit(cat)}>
                          <Pencil size={15} />
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Delete"
                          onClick={() => setDeleteTarget(cat)}
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
          title={editCat ? "Edit Category" : "Add Category"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editCat ? "Save Changes" : "Create Category"}
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
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">SAP MTART Code</label>
                <input
                  className="form-input"
                  placeholder="e.g. ROH, FERT, HAWA"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Category?"
          message={`"${deleteTarget.name}" will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
