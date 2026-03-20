"""
SAP MM Standard Material Groups seed script.
Run once: python seed.py
Also called automatically on app startup if categories collection is empty.
"""
import asyncio
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

SAP_MM_CATEGORIES = [
    {
        "code": "ROH",
        "name": "Raw Materials",
        "description": "Basic materials used in production (SAP MTART: ROH)",
    },
    {
        "code": "HALB",
        "name": "Semi-Finished Goods",
        "description": "Partially processed materials awaiting further production (SAP MTART: HALB)",
    },
    {
        "code": "FERT",
        "name": "Finished Goods",
        "description": "Completed products ready for sale or delivery (SAP MTART: FERT)",
    },
    {
        "code": "HAWA",
        "name": "Trading Goods",
        "description": "Goods purchased and sold without further processing (SAP MTART: HAWA)",
    },
    {
        "code": "ERSA",
        "name": "Spare Parts",
        "description": "Replacement parts for machinery and equipment (SAP MTART: ERSA)",
    },
    {
        "code": "VERP",
        "name": "Packaging Materials",
        "description": "Materials used for packaging finished products (SAP MTART: VERP)",
    },
    {
        "code": "NLAG",
        "name": "Non-Stock Materials",
        "description": "Consumable materials not managed in stock (SAP MTART: NLAG)",
    },
    {
        "code": "DIEN",
        "name": "Services",
        "description": "External and internal services procured via MM (SAP MTART: DIEN)",
    },
    {
        "code": "LEIH",
        "name": "Returnable Packaging",
        "description": "Reusable packaging materials tracked separately (SAP MTART: LEIH)",
    },
    {
        "code": "IBAU",
        "name": "Maintenance, Repair & Operations",
        "description": "MRO supplies used in plant maintenance (SAP MTART: IBAU)",
    },
    {
        "code": "FHMI",
        "name": "Production Resources & Tools",
        "description": "Equipment and tools used in production processes (SAP MTART: FHMI)",
    },
    {
        "code": "KMAT",
        "name": "Configurable Materials",
        "description": "Materials with variant configurations (SAP MTART: KMAT)",
    },
]


async def seed_categories(db):
    existing_count = await db.categories.count_documents({})
    if existing_count > 0:
        print(f"Categories already exist ({existing_count} found). Skipping seed.")
        return 0

    now = datetime.now(timezone.utc)
    docs = [
        {**cat, "created_at": now}
        for cat in SAP_MM_CATEGORIES
    ]
    result = await db.categories.insert_many(docs)
    print(f"Seeded {len(result.inserted_ids)} SAP MM standard categories.")
    return len(result.inserted_ids)


async def main():
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    await seed_categories(db)
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
