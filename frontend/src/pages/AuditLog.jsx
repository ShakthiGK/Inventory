import { useEffect, useState, useCallback } from "react";
import { getAuditLogs } from "../api";
import { ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

const ACTION_META = {
  CREATE:     { badgeClass: "badge-green",  label: "CREATE"     },
  UPDATE:     { badgeClass: "badge-blue",   label: "UPDATE"     },
  DELETE:     { badgeClass: "badge-red",    label: "DELETE"     },
  STOCK_IN:   { badgeClass: "badge-green",  label: "STOCK IN"   },
  STOCK_OUT:  { badgeClass: "badge-red",    label: "STOCK OUT"  },
  ADJUSTMENT: { badgeClass: "badge-yellow", label: "ADJUSTMENT" },
  RETURN:     { badgeClass: "badge-yellow", label: "RETURN"     },
  TRANSFER:   { badgeClass: "badge-gray",   label: "TRANSFER"   },
  DAMAGE:     { badgeClass: "badge-red",    label: "DAMAGE"     },
  INITIAL:    { badgeClass: "badge-blue",   label: "INITIAL"    },
};

function ActionBadge({ action }) {
  const meta = ACTION_META[action] || { badgeClass: "badge-gray", label: action };
  return <span className={`badge ${meta.badgeClass}`}>{meta.label}</span>;
}

function ChangesCell({ changes }) {
  const [expanded, setExpanded] = useState(false);
  if (!changes || Object.keys(changes).length === 0) return <span style={{ color: "var(--gray-400)" }}>—</span>;

  const entries = Object.entries(changes);
  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--primary)", fontSize: 12, display: "flex",
          alignItems: "center", gap: 4, fontWeight: 500,
        }}
      >
        {entries.length} field{entries.length > 1 ? "s" : ""} changed
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {expanded && (
        <div style={{ marginTop: 6 }}>
          {entries.map(([field, val]) => (
            <div key={field} style={{
              fontSize: 12, background: "var(--gray-50)",
              border: "1px solid var(--gray-200)", borderRadius: 6,
              padding: "4px 8px", marginBottom: 4,
            }}>
              <strong style={{ color: "var(--gray-700)" }}>{field}</strong>
              {val.from !== undefined && (
                <span>
                  {" "}<span style={{ color: "var(--danger)" }}>{String(val.from)}</span>
                  {" → "}
                  <span style={{ color: "var(--success)" }}>{String(val.to)}</span>
                </span>
              )}
              {val.reason && (
                <span style={{ color: "var(--gray-400)", marginLeft: 8 }}>
                  ({val.reason})
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEntity, setFilterEntity] = useState("");
  const [filterAction, setFilterAction] = useState("");

  const fetchLogs = useCallback(() => {
    const params = {};
    if (filterEntity) params.entity_type = filterEntity;
    if (filterAction) params.action = filterAction;
    return getAuditLogs(params).then((r) => setLogs(r.data));
  }, [filterEntity, filterAction]);

  useEffect(() => {
    setLoading(true);
    fetchLogs().finally(() => setLoading(false));
  }, [fetchLogs]);

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });

  return (
    <div>
      <div className="toolbar">
        <select
          className="form-input"
          style={{ width: "auto", minWidth: 160 }}
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
        >
          <option value="">All Entity Types</option>
          <option value="product">Product</option>
          <option value="category">Category</option>
        </select>
        <select
          className="form-input"
          style={{ width: "auto", minWidth: 160 }}
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="">All Actions</option>
          {Object.keys(ACTION_META).map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Audit Log ({logs.length} entries)</h2>
          <div style={{ fontSize: 13, color: "var(--gray-400)" }}>
            All system changes are recorded here
          </div>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /> Loading...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck size={40} />
            <h3>No audit logs yet</h3>
            <p>All create, update, delete and stock changes will be logged here.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Name</th>
                  <th>Changes</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ color: "var(--gray-500)", whiteSpace: "nowrap", fontSize: 13 }}>
                      {formatDate(log.timestamp)}
                    </td>
                    <td><ActionBadge action={log.action} /></td>
                    <td>
                      <span className={`badge ${log.entity_type === "product" ? "badge-blue" : "badge-gray"}`}>
                        {log.entity_type}
                      </span>
                    </td>
                    <td><div className="product-name">{log.entity_name}</div></td>
                    <td><ChangesCell changes={log.changes} /></td>
                    <td>
                      <div style={{ fontSize: 13 }}>
                        <div style={{ fontWeight: 500 }}>{log.user_name || "—"}</div>
                        <div style={{ color: "var(--gray-400)", fontSize: 11 }}>{log.user_email}</div>
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
