from fastapi import APIRouter, HTTPException, Query, Request
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional
from database import get_db
from models import ProductCreate, ProductUpdate, Product, StockUpdate
from audit_helper import (
    get_user_info, write_audit_log, write_stock_movement, diff_changes
)

router = APIRouter(prefix="/products", tags=["products"])

TRACKED_FIELDS = ["name", "sku", "description", "category_name", "price",
                  "quantity", "low_stock_threshold", "unit"]


def serialize_product(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "description": doc.get("description"),
        "category_id": doc.get("category_id"),
        "category_name": doc.get("category_name"),
        "sku": doc["sku"],
        "price": doc["price"],
        "quantity": doc.get("quantity", 0),
        "low_stock_threshold": doc.get("low_stock_threshold", 10),
        "unit": doc.get("unit", "pcs"),
        "created_at": doc.get("created_at", datetime.now(timezone.utc)),
        "updated_at": doc.get("updated_at", datetime.now(timezone.utc)),
    }


@router.get("/", response_model=list[Product])
async def get_products(
    search: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    low_stock: Optional[bool] = Query(None),
):
    db = get_db()
    query = {}

    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"sku": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]

    if category_id:
        query["category_id"] = category_id

    if low_stock is True:
        query["$expr"] = {"$lte": ["$quantity", "$low_stock_threshold"]}

    products = await db.products.find(query).sort("name", 1).to_list(1000)
    return [serialize_product(p) for p in products]


@router.post("/", response_model=Product, status_code=201)
async def create_product(product: ProductCreate, request: Request):
    db = get_db()
    existing = await db.products.find_one({"sku": product.sku})
    if existing:
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")

    now = datetime.now(timezone.utc)
    doc = {**product.model_dump(), "created_at": now, "updated_at": now}
    result = await db.products.insert_one(doc)
    created = await db.products.find_one({"_id": result.inserted_id})

    user = get_user_info(request)
    await write_audit_log(db, "CREATE", "product", str(result.inserted_id),
                          product.name, user)

    if product.quantity > 0:
        await write_stock_movement(db, created, product.quantity, 0,
                                   "INITIAL", "Initial stock on creation", user)

    return serialize_product(created)


@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    db = get_db()
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    doc = await db.products.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_product(doc)


@router.put("/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductUpdate, request: Request):
    db = get_db()
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    old_doc = await db.products.find_one({"_id": oid})
    if not old_doc:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = {k: v for k, v in product.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_data["updated_at"] = datetime.now(timezone.utc)

    if "sku" in update_data:
        existing = await db.products.find_one({"sku": update_data["sku"], "_id": {"$ne": oid}})
        if existing:
            raise HTTPException(status_code=400, detail="SKU already in use by another product")

    await db.products.update_one({"_id": oid}, {"$set": update_data})
    updated = await db.products.find_one({"_id": oid})

    user = get_user_info(request)
    changes = diff_changes(old_doc, updated, TRACKED_FIELDS)
    if changes:
        await write_audit_log(db, "UPDATE", "product", product_id,
                              updated["name"], user, changes)

    return serialize_product(updated)


@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: str, request: Request):
    db = get_db()
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    doc = await db.products.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")

    result = await db.products.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    user = get_user_info(request)
    await write_audit_log(db, "DELETE", "product", product_id, doc["name"], user)


@router.patch("/{product_id}/stock", response_model=Product)
async def update_stock(product_id: str, stock_update: StockUpdate, request: Request):
    db = get_db()
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    doc = await db.products.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")

    quantity_before = doc["quantity"]
    new_quantity = quantity_before + stock_update.quantity_change
    if new_quantity < 0:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    await db.products.update_one(
        {"_id": oid},
        {"$set": {"quantity": new_quantity, "updated_at": datetime.now(timezone.utc)}},
    )
    updated = await db.products.find_one({"_id": oid})

    user = get_user_info(request)
    movement_type = stock_update.movement_type or (
        "STOCK_IN" if stock_update.quantity_change > 0 else "STOCK_OUT"
    )
    await write_stock_movement(
        db, doc, stock_update.quantity_change, quantity_before,
        movement_type, stock_update.reason or "Manual adjustment", user
    )
    await write_audit_log(
        db, movement_type, "product", product_id, doc["name"], user,
        {"quantity": {"from": quantity_before, "to": new_quantity,
                      "reason": stock_update.reason}}
    )

    return serialize_product(updated)
