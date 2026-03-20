from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_db, close_db, get_db
from routes import categories, products, dashboard, audit, movements
from seed import seed_categories


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    await seed_categories(get_db())
    yield
    await close_db()


app = FastAPI(
    title="Inventory Management API",
    description="REST API for managing inventory, products and categories",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(movements.router, prefix="/api")
app.include_router(audit.router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Inventory Management API", "docs": "/docs"}
