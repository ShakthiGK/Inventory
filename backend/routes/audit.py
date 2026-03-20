from fastapi import APIRouter, Query
from typing import Optional
from database import get_db
from models import AuditLog

router = APIRouter(prefix="/audit", tags=["audit-logs"])


def serialize_log(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "action": doc.get("action"),
        "entity_type": doc.get("entity_type"),
        "entity_id": doc.get("entity_id"),
        "entity_name": doc.get("entity_name"),
        "changes": doc.get("changes"),
        "user_name": doc.get("user_name"),
        "user_email": doc.get("user_email"),
        "timestamp": doc.get("timestamp"),
    }


@router.get("/", response_model=list[AuditLog])
async def get_audit_logs(
    entity_type: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    user_email: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
):
    db = get_db()
    query = {}
    if entity_type:
        query["entity_type"] = entity_type
    if action:
        query["action"] = action
    if user_email:
        query["user_email"] = user_email

    docs = await db.audit_logs.find(query).sort("timestamp", -1).to_list(limit)
    return [serialize_log(d) for d in docs]
