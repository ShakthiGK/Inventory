from fastapi import APIRouter
from database import get_db
from models import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats():
    db = get_db()

    total_products = await db.products.count_documents({})
    total_categories = await db.categories.count_documents({})

    pipeline_low = [
        {"$match": {"$expr": {"$lte": ["$quantity", "$low_stock_threshold"]}, "quantity": {"$gt": 0}}}
    ]
    low_stock_docs = await db.products.aggregate(pipeline_low).to_list(None)
    low_stock_count = len(low_stock_docs)

    out_of_stock_count = await db.products.count_documents({"quantity": 0})

    pipeline_value = [
        {"$group": {"_id": None, "total": {"$sum": {"$multiply": ["$price", "$quantity"]}}}}
    ]
    value_result = await db.products.aggregate(pipeline_value).to_list(1)
    total_value = value_result[0]["total"] if value_result else 0.0

    return DashboardStats(
        total_products=total_products,
        total_categories=total_categories,
        low_stock_count=low_stock_count,
        out_of_stock_count=out_of_stock_count,
        total_inventory_value=total_value,
    )
