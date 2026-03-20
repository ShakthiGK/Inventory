from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    code: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None


class Category(CategoryBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    sku: str
    price: float = Field(ge=0)
    quantity: int = Field(ge=0, default=0)
    low_stock_threshold: int = Field(ge=0, default=10)
    unit: Optional[str] = "pcs"


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    unit: Optional[str] = None


class Product(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StockUpdate(BaseModel):
    quantity_change: int
    movement_type: Optional[str] = "ADJUSTMENT"
    reason: Optional[str] = None


class DashboardStats(BaseModel):
    total_products: int
    total_categories: int
    low_stock_count: int
    out_of_stock_count: int
    total_inventory_value: float


class StockMovement(BaseModel):
    id: str
    product_id: str
    product_name: str
    sku: str
    movement_type: str
    quantity_change: int
    quantity_before: int
    quantity_after: int
    reason: Optional[str] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


class AuditLog(BaseModel):
    id: str
    action: str
    entity_type: str
    entity_id: str
    entity_name: str
    changes: Optional[dict] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
