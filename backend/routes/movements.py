from fastapi import APIRouter, Query
from typing import Optional
from database import get_db
from models import StockMovement

router = APIRouter(prefix="/movements", tags=["stock-movements"])


def serialize_movement(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "product_id": doc.get("product_id"),
        "product_name": doc.get("product_name"),
        "sku": doc.get("sku"),
        "movement_type": doc.get("movement_type"),
        "quantity_change": doc.get("quantity_change"),
        "quantity_before": doc.get("quantity_before"),
        "quantity_after": doc.get("quantity_after"),
        "reason": doc.get("reason"),
        "user_name": doc.get("user_name"),
        "user_email": doc.get("user_email"),
        "timestamp": doc.get("timestamp"),
    }


@router.get("/", response_model=list[StockMovement])
async def get_movements(
    product_id: Optional[str] = Query(None),
    movement_type: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
):
    db = get_db()
    query = {}
    if product_id:
        query["product_id"] = product_id
    if movement_type:
        query["movement_type"] = movement_type

    docs = await db.stock_movements.find(query).sort("timestamp", -1).to_list(limit)
    return [serialize_movement(d) for d in docs]
