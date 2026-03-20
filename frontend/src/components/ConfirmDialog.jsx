import { Trash2 } from "lucide-react";
import Modal from "./Modal";

export default function ConfirmDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <Modal
      title=""
      onClose={onCancel}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </button>
        </>
      }
    >
      <div className="confirm-icon">
        <Trash2 size={22} />
      </div>
      <div className="confirm-text">
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </Modal>
  );
}
