from datetime import datetime, timezone
from fastapi import Request


def get_user_info(request: Request) -> dict:
    return {
        "user_name": request.headers.get("X-User-Name", "System"),
        "user_email": request.headers.get("X-User-Email", "system@app"),
    }


async def write_audit_log(db, action: str, entity_type: str, entity_id: str,
                          entity_name: str, user_info: dict, changes: dict = None):
    doc = {
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "entity_name": entity_name,
        "changes": changes,
        "user_name": user_info.get("user_name"),
        "user_email": user_info.get("user_email"),
        "timestamp": datetime.now(timezone.utc),
    }
    await db.audit_logs.insert_one(doc)


async def write_stock_movement(db, product: dict, quantity_change: int,
                               quantity_before: int, movement_type: str,
                               reason: str, user_info: dict):
    doc = {
        "product_id": str(product["_id"]),
        "product_name": product["name"],
        "sku": product["sku"],
        "movement_type": movement_type,
        "quantity_change": quantity_change,
        "quantity_before": quantity_before,
        "quantity_after": quantity_before + quantity_change,
        "reason": reason,
        "user_name": user_info.get("user_name"),
        "user_email": user_info.get("user_email"),
        "timestamp": datetime.now(timezone.utc),
    }
    await db.stock_movements.insert_one(doc)


def diff_changes(old: dict, new: dict, fields: list) -> dict:
    """Return only fields that changed between old and new."""
    changes = {}
    for field in fields:
        old_val = old.get(field)
        new_val = new.get(field)
        if old_val != new_val:
            changes[field] = {"from": old_val, "to": new_val}
    return changes
