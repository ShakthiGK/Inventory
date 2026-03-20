from fastapi import APIRouter, HTTPException, Request
from bson import ObjectId
from datetime import datetime, timezone
from database import get_db
from models import CategoryCreate, CategoryUpdate, Category
from audit_helper import get_user_info, write_audit_log, diff_changes

router = APIRouter(prefix="/categories", tags=["categories"])

TRACKED_FIELDS = ["name", "description", "code"]


def serialize_category(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "code": doc.get("code"),
        "description": doc.get("description"),
        "created_at": doc.get("created_at", datetime.now(timezone.utc)),
    }


@router.get("/", response_model=list[Category])
async def get_categories():
    db = get_db()
    categories = await db.categories.find().sort("name", 1).to_list(1000)
    return [serialize_category(c) for c in categories]


@router.post("/", response_model=Category, status_code=201)
async def create_category(category: CategoryCreate, request: Request):
    db = get_db()
    existing = await db.categories.find_one(
        {"name": {"$regex": f"^{category.name}$", "$options": "i"}}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    doc = {**category.model_dump(), "created_at": datetime.now(timezone.utc)}
    result = await db.categories.insert_one(doc)
    created = await db.categories.find_one({"_id": result.inserted_id})

    user = get_user_info(request)
    await write_audit_log(db, "CREATE", "category", str(result.inserted_id),
                          category.name, user)

    return serialize_category(created)


@router.get("/{category_id}", response_model=Category)
async def get_category(category_id: str):
    db = get_db()
    try:
        oid = ObjectId(category_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid category ID")

    doc = await db.categories.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Category not found")
    return serialize_category(doc)


@router.put("/{category_id}", response_model=Category)
async def update_category(category_id: str, category: CategoryUpdate, request: Request):
    db = get_db()
    try:
        oid = ObjectId(category_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid category ID")

    old_doc = await db.categories.find_one({"_id": oid})
    if not old_doc:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = {k: v for k, v in category.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    await db.categories.update_one({"_id": oid}, {"$set": update_data})
    updated = await db.categories.find_one({"_id": oid})

    user = get_user_info(request)
    changes = diff_changes(old_doc, updated, TRACKED_FIELDS)
    if changes:
        await write_audit_log(db, "UPDATE", "category", category_id,
                              updated["name"], user, changes)

    return serialize_category(updated)


@router.delete("/{category_id}", status_code=204)
async def delete_category(category_id: str, request: Request):
    db = get_db()
    try:
        oid = ObjectId(category_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid category ID")

    doc = await db.categories.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Category not found")

    result = await db.categories.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")

    user = get_user_info(request)
    await write_audit_log(db, "DELETE", "category", category_id, doc["name"], user)
