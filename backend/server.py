from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_en: str
    description: str
    description_en: str
    price: float
    original_price: Optional[float] = None
    image_url: str
    category: str
    stock: int = 0
    featured: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    name_en: str
    description: str
    description_en: str
    price: float
    original_price: Optional[float] = None
    image_url: str
    category: str
    stock: int = 0
    featured: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Khang Trầm Hương API"}

@api_router.get("/products", response_model=List[Product])
async def get_products(featured: Optional[bool] = None, category: Optional[str] = None):
    """Get all products with optional filtering"""
    query = {}
    if featured is not None:
        query["featured"] = featured
    if category:
        query["category"] = category
    
    products = await db.products.find(query).sort("created_at", -1).to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a specific product by ID"""
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    """Create a new product"""
    product_dict = product.dict()
    product_obj = Product(**product_dict)
    await db.products.insert_one(product_obj.dict())
    return product_obj

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_update: ProductUpdate):
    """Update a product"""
    existing_product = await db.products.find_one({"id": product_id})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated_product = await db.products.find_one({"id": product_id})
    return Product(**updated_product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    """Delete a product"""
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize the database with sample products"""
    # Check if products already exist
    existing_products = await db.products.count_documents({})
    if existing_products == 0:
        # Create sample products
        sample_products = [
            {
                "id": str(uuid.uuid4()),
                "name": "Trầm Hương Kỳ Nam Cao Cấp",
                "name_en": "Premium Kynam Agarwood",
                "description": "Trầm hương Kỳ Nam đặc biệt với hương thơm nồng nàn, quý hiếm. Sản phẩm cao cấp từ rừng tự nhiên.",
                "description_en": "Premium Kynam Agarwood with intense fragrance, rare and precious. High-quality product from natural forests.",
                "price": 2500000,
                "original_price": 3000000,
                "image_url": "https://images.unsplash.com/photo-1613750255797-7d4f877615df",
                "category": "Kỳ Nam",
                "stock": 5,
                "featured": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Trầm Hương Tự Nhiên",
                "name_en": "Natural Agarwood",
                "description": "Trầm hương tự nhiên chất lượng cao, hương thơm tinh tế và bền lâu. Phù hợp cho thưởng thức hàng ngày.",
                "description_en": "High-quality natural agarwood with delicate and long-lasting fragrance. Perfect for daily enjoyment.",
                "price": 800000,
                "original_price": 1000000,
                "image_url": "https://images.unsplash.com/photo-1652719647182-094f5c442abc",
                "category": "Tự Nhiên",
                "stock": 10,
                "featured": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Trầm Hương Truyền Thống",
                "name_en": "Traditional Agarwood",
                "description": "Trầm hương theo phương pháp truyền thống, được chế biến cẩn thận với hương thơm đậm đà.",
                "description_en": "Traditional agarwood processed with care, featuring rich and deep fragrance.",
                "price": 1200000,
                "image_url": "https://images.pexels.com/photos/14146722/pexels-photo-14146722.jpeg",
                "category": "Truyền Thống",
                "stock": 8,
                "featured": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Trầm Hương Sáng",
                "name_en": "Light Agarwood",
                "description": "Trầm hương sáng với hương thơm nhẹ nhàng, thanh thoát. Lý tưởng cho không gian yên tĩnh.",
                "description_en": "Light agarwood with gentle, pure fragrance. Ideal for peaceful spaces.",
                "price": 600000,
                "image_url": "https://images.unsplash.com/photo-1600122646819-75abc00c88a6",
                "category": "Sáng",
                "stock": 15,
                "featured": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        await db.products.insert_many(sample_products)
        logger.info("Sample products inserted successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()